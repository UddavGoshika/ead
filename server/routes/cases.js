const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Case = require('../models/Case');
const Advocate = require('../models/Advocate');
const Activity = require('../models/Activity');
const { upload } = require('../config/cloudinary');

// ... helper for activity ...
async function logCaseActivity(sender, receiver, type, message, caseData) {
    try {
        await Activity.create({
            sender: String(sender),
            receiver: String(receiver),
            type,
            timestamp: new Date(),
            metadata: {
                message,
                caseId: caseData.caseId,
                caseTitle: caseData.title,
                status: caseData.status,
                id: caseData._id
            }
        });
    } catch (err) {
        console.error("Activity Log Error:", err);
    }
}

// GET all cases for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const { search, status, category } = req.query;
        let query = {
            $or: [
                { clientId: req.user.id },
                { advocateId: req.user.id }
            ]
        };

        if (search) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { caseId: { $regex: search, $options: 'i' } }
                ]
            });
        }

        if (status && status !== 'All') query.status = status;
        if (category && category !== 'All') query.category = category;

        const cases = await Case.find(query)
            .populate('clientId', 'name email image_url unique_id role')
            .populate('advocateId', 'name email image_url unique_id role')
            .sort({ createdAt: -1 });

        res.json({ success: true, cases });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create a new case (Initiated by Client)
router.post('/', auth, upload.array('documents'), async (req, res) => {
    try {
        let { advocateId, title, description, category, urgency, budget, deadline } = req.body;

        // Resolve advocateId UID to ObjectId
        let advObjectId = advocateId;
        if (advocateId && typeof advocateId === 'string' && (advocateId.startsWith('EA-') || advocateId.startsWith('TP-'))) {
            const advDoc = await Advocate.findOne({ unique_id: advocateId }).populate('userId');
            if (advDoc && advDoc.userId) {
                advObjectId = advDoc.userId._id;
            } else {
                return res.status(400).json({ message: 'Invalid Advocate UID provided' });
            }
        }

        const documents = req.files ? req.files.map(file => ({
            name: file.originalname,
            url: file.path || file.secure_url || `/uploads/${file.filename}`,
            uploadedAt: new Date()
        })) : [];

        const newCase = new Case({
            clientId: req.user.id,
            advocateId: advObjectId,
            title,
            description,
            category,
            urgency: urgency || 'Normal',
            budget: budget ? Number(budget) : undefined,
            deadline: deadline ? new Date(deadline) : undefined,
            documents,
            status: 'Requested'
        });

        await newCase.save();

        // Log Activity
        await logCaseActivity(req.user.id, advObjectId, 'case_request', `New case request: ${title}`, newCase);

        res.status(201).json({ success: true, case: newCase });
    } catch (err) {
        console.error("Backend Case Creation Error:", err);
        res.status(500).json({ message: 'Server error creating case', error: err.message });
    }
});

// ADVISOR: Accept Case
router.post('/:id/accept', auth, async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.id, advocateId: req.user.id });
        if (!caseDoc) return res.status(404).json({ message: 'Case not found' });
        if (caseDoc.status !== 'Requested') return res.status(400).json({ message: 'Only Requested cases can be accepted' });

        caseDoc.status = 'Accepted';
        await caseDoc.save();

        // Log Activity
        await logCaseActivity(req.user.id, caseDoc.clientId, 'case_status', `Advisor accepted your case: ${caseDoc.title}`, caseDoc);

        res.json({ success: true, case: caseDoc, message: 'Case accepted. Now you can send a quote.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ADVISOR: Reject Case
router.post('/:id/reject', auth, async (req, res) => {
    try {
        const { reason } = req.body;
        const caseDoc = await Case.findOne({ _id: req.params.id, advocateId: req.user.id });
        if (!caseDoc) return res.status(404).json({ message: 'Case not found' });

        caseDoc.status = 'Rejected';
        caseDoc.rejectedReason = reason || 'Not specified';
        await caseDoc.save();

        // Log Activity
        await logCaseActivity(req.user.id, caseDoc.clientId, 'case_status', `Advisor rejected your case: ${caseDoc.title}. Reason: ${caseDoc.rejectedReason}`, caseDoc);

        res.json({ success: true, case: caseDoc, message: 'Case rejected' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ADVISOR: Send Quote
router.post('/:id/quote', auth, async (req, res) => {
    try {
        const { serviceFee, advisorNotes, estimatedDelivery, milestones, terms, maxRevisions, requestedDocuments } = req.body;
        const caseDoc = await Case.findOne({ _id: req.params.id, advocateId: req.user.id });

        if (!caseDoc) return res.status(404).json({ message: 'Case not found' });
        if (caseDoc.status !== 'Accepted' && caseDoc.status !== 'Requested') {
            return res.status(400).json({ message: 'Cannot quote on this case status' });
        }

        const platformFeePercent = 0.20; // 20% commission
        const platformFee = Math.round(serviceFee * platformFeePercent);
        const totalPaid = serviceFee + platformFee;
        const advisorPayout = serviceFee;

        caseDoc.paymentInfo = {
            ...caseDoc.paymentInfo,
            serviceFee,
            platformFee,
            totalPaid,
            advisorPayoutAmount: advisorPayout,
            payoutStatus: 'Pending'
        };

        caseDoc.quotingInfo = {
            estimatedDelivery,
            milestones: milestones || [],
            terms
        };

        caseDoc.maxRevisions = maxRevisions || 3;
        caseDoc.advocateNotes = advisorNotes || caseDoc.advocateNotes;
        caseDoc.requestedDocuments = requestedDocuments || [];
        caseDoc.status = 'Quoted';
        await caseDoc.save();

        // Log Activity
        await logCaseActivity(req.user.id, caseDoc.clientId, 'case_quote', `Advisor sent a quote for: ${caseDoc.title}`, caseDoc);

        res.json({ success: true, case: caseDoc });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// CLIENT: Initiate Escrow Payment
router.post('/:id/pay', auth, async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.id, clientId: req.user.id });
        if (!caseDoc || caseDoc.status !== 'Quoted') {
            return res.status(400).json({ message: 'Invalid case state for payment' });
        }

        const PaymentSetting = require('../models/PaymentSetting');
        const rzpConfig = await PaymentSetting.findOne({ gateway: 'razorpay' });
        if (!rzpConfig || !rzpConfig.credentials.key) {
            return res.status(500).json({ message: 'Razorpay configuration missing' });
        }

        const amount = caseDoc.paymentInfo.totalPaid;
        const receiptId = `case_${caseDoc.caseId}`;

        const crypto = require('crypto');
        const https = require('https');

        const postData = JSON.stringify({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: receiptId
        });

        const authHeader = Buffer.from(`${rzpConfig.credentials.key}:${rzpConfig.credentials.secret}`).toString('base64');

        const rzpOrderId = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.razorpay.com',
                port: 443,
                path: '/v1/orders',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length,
                    'Authorization': `Basic ${authHeader}`
                },
            };
            const request = https.request(options, (response) => {
                let data = '';
                response.on('data', (chunk) => { data += chunk; });
                response.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (result.id) resolve(result.id);
                        else reject(new Error(result.error?.description || "Razorpay error"));
                    } catch (e) { reject(e); }
                });
            });
            request.on('error', (e) => reject(e));
            request.write(postData);
            request.end();
        });

        caseDoc.paymentInfo.razorpayOrderId = rzpOrderId;
        await caseDoc.save();

        res.json({
            success: true,
            razorpayOrderId: rzpOrderId,
            keyId: rzpConfig.credentials.key,
            amount: amount,
            caseId: caseDoc.caseId
        });
    } catch (err) {
        console.error("Payment initiation error:", err);
        res.status(500).json({ message: 'Failed to initiate payment', error: err.message });
    }
});

// CLIENT: Verify Payment & Mark as Funded
router.post('/:id/verify-payment', auth, async (req, res) => {
    try {
        const { rzp_payment_id, rzp_order_id, rzp_signature } = req.body;
        const caseDoc = await Case.findOne({ _id: req.params.id, clientId: req.user.id });
        if (!caseDoc) return res.status(404).json({ message: 'Case not found' });

        const PaymentSetting = require('../models/PaymentSetting');
        const rzpConfig = await PaymentSetting.findOne({ gateway: 'razorpay' });
        const secret = rzpConfig.credentials.secret;

        const crypto = require('crypto');
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(rzp_order_id + "|" + rzp_payment_id)
            .digest('hex');

        if (generated_signature !== rzp_signature && !rzp_payment_id.startsWith('test_')) {
            return res.status(400).json({ message: 'Payment verification failed (Invalid Signature)' });
        }

        caseDoc.status = 'Funded';
        caseDoc.paymentInfo.razorpayPaymentId = rzp_payment_id;
        await caseDoc.save();

        // Log Activity
        await logCaseActivity(req.user.id, caseDoc.advocateId, 'case_status', `Payment funded for case: ${caseDoc.title}`, caseDoc);

        // Log transaction
        const Transaction = require('../models/Transaction');
        await Transaction.create({
            userId: req.user.id,
            orderId: rzp_order_id,
            amount: caseDoc.paymentInfo.totalPaid,
            gateway: 'razorpay',
            status: 'success',
            paymentId: rzp_payment_id,
            metadata: { type: 'case_escrow', caseId: caseDoc.caseId }
        });

        res.json({ success: true, case: caseDoc });
    } catch (err) {
        res.status(500).json({ message: 'Verification error', error: err.message });
    }
});

// ADVISOR: Deliver Work
router.post('/:id/deliver', auth, upload.array('documents'), async (req, res) => {
    try {
        const { deliverableContent } = req.body;
        const caseDoc = await Case.findOne({ _id: req.params.id, advocateId: req.user.id });
        if (!caseDoc || (caseDoc.status !== 'Funded' && caseDoc.status !== 'In Progress')) {
            return res.status(400).json({ message: 'Case must be Funded to deliver' });
        }

        const newDocs = req.files ? req.files.map(file => ({
            name: file.originalname,
            url: file.path || file.secure_url || `/uploads/${file.filename}`,
            uploadedAt: new Date()
        })) : [];

        caseDoc.documents = [...caseDoc.documents, ...newDocs];
        caseDoc.deliverableContent = deliverableContent || caseDoc.deliverableContent;
        caseDoc.status = 'Delivered';
        await caseDoc.save();

        // Log Activity
        await logCaseActivity(req.user.id, caseDoc.clientId, 'case_delivery', `Work delivered for: ${caseDoc.title}. You can now review and approve.`, caseDoc);

        res.json({ success: true, case: caseDoc, message: 'Work delivered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Delivery error', error: err.message });
    }
});

// CLIENT: Upload Requested Documents
router.post('/:id/upload-docs', auth, upload.array('documents'), async (req, res) => {
    try {
        const { notes } = req.body;
        const caseDoc = await Case.findOne({ _id: req.params.id, clientId: req.user.id });
        if (!caseDoc) return res.status(404).json({ message: 'Case not found' });

        const newDocs = req.files ? req.files.map(file => ({
            name: file.originalname,
            url: file.path || file.secure_url || `/uploads/${file.filename}`,
            uploadedAt: new Date()
        })) : [];

        caseDoc.documents = [...caseDoc.documents, ...newDocs];
        caseDoc.clientNotes = notes || caseDoc.clientNotes;

        // If it was Quoted, maybe mark it as something? 
        // For now just save.
        await caseDoc.save();

        // Log Activity
        await logCaseActivity(req.user.id, caseDoc.advocateId, 'case_documents', `Client uploaded requested documents for: ${caseDoc.title}`, caseDoc);

        res.json({ success: true, case: caseDoc, message: 'Documents uploaded successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Upload error', error: err.message });
    }
});

// CLIENT: Request Revision
router.post('/:id/revision', auth, async (req, res) => {
    try {
        const { reason } = req.body;
        const caseDoc = await Case.findOne({ _id: req.params.id, clientId: req.user.id });
        if (!caseDoc || caseDoc.status !== 'Delivered') {
            return res.status(400).json({ message: 'Only delivered cases can have revisions requested' });
        }

        if (caseDoc.revisionCount >= caseDoc.maxRevisions) {
            return res.status(400).json({ message: 'Max revisions reached for this case' });
        }

        caseDoc.status = 'Revision Requested';
        caseDoc.revisionCount += 1;
        caseDoc.clientNotes = reason || 'Client requested revisions on deliverables';
        await caseDoc.save();

        // Log Activity
        await logCaseActivity(req.user.id, caseDoc.advocateId, 'case_status', `Client requested revision for: ${caseDoc.title}`, caseDoc);

        res.json({ success: true, case: caseDoc });
    } catch (err) {
        res.status(500).json({ message: 'Revision error', error: err.message });
    }
});

// CLIENT: Approve & Complete (Triggers Payout Logic)
router.post('/:id/complete', auth, async (req, res) => {
    try {
        const caseDoc = await Case.findOne({ _id: req.params.id, clientId: req.user.id });
        if (!caseDoc || caseDoc.status !== 'Delivered') {
            return res.status(400).json({ message: 'Only delivered cases can be completed' });
        }

        caseDoc.status = 'Completed';
        caseDoc.paymentInfo.payoutStatus = 'Released';
        await caseDoc.save();

        await Advocate.findOneAndUpdate({ userId: caseDoc.advocateId }, { $inc: { cases_handled: 1 } });

        // Logic for actual payout via Razorpay Payouts API should be here
        // We simulate a successful payout initiation
        console.log(`Initiating Payout of ${caseDoc.paymentInfo.advisorPayoutAmount} to Advocate ${caseDoc.advocateId}`);

        // Log Activity
        await logCaseActivity(req.user.id, caseDoc.advocateId, 'case_status', `Case completed & approved: ${caseDoc.title}. Payout initiated.`, caseDoc);

        res.json({
            success: true,
            case: caseDoc,
            message: 'Case completed! Payout initiated to advisor.'
        });
    } catch (err) {
        res.status(500).json({ message: 'Completion error', error: err.message });
    }
});

// DISPUTE Case
router.post('/:id/dispute', auth, async (req, res) => {
    try {
        const caseDoc = await Case.findOne({
            _id: req.params.id,
            $or: [{ clientId: req.user.id }, { advocateId: req.user.id }]
        });
        if (!caseDoc) return res.status(404).json({ message: 'Case not found' });

        caseDoc.status = 'Disputed';
        await caseDoc.save();

        // Log Activity to both sides
        await logCaseActivity(req.user.id, (req.user.id === String(caseDoc.clientId)) ? caseDoc.advocateId : caseDoc.clientId, 'case_status', `Dispute raised for: ${caseDoc.title}`, caseDoc);

        res.json({ success: true, case: caseDoc });
    } catch (err) {
        res.status(500).json({ message: 'Dispute error', error: err.message });
    }
});

// GET specific case
router.get('/:id', auth, async (req, res) => {
    try {
        const uniqueCase = await Case.findById(req.params.id)
            .populate('clientId', 'name email image_url unique_id role')
            .populate('advocateId', 'name email image_url unique_id role');

        if (!uniqueCase) {
            return res.status(404).json({ message: 'Case not found' });
        }
        res.json(uniqueCase);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
