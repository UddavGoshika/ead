const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Package = require('./models/Package');

async function seedPackages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing packages
        await Package.deleteMany({});
        console.log('Cleared existing packages');

        const packages = [
            // ADVOCATE PACKAGES
            {
                memberType: 'advocate',
                name: 'Free',
                description: 'Basic access with essential features',
                icon: 'star',
                gradient: 'from-gray-500 to-gray-700',
                sortOrder: 1,
                tiers: [
                    {
                        name: 'Standard',
                        price: 0,
                        coins: 10,
                        active: true,
                        features: ["Basic Profile", "Limited Visibility", "Email Support"],
                        badgeColor: "#94a3b8",
                        glowColor: "rgba(148, 163, 184, 0.2)"
                    }
                ]
            },
            {
                memberType: 'advocate',
                name: 'Pro Lite',
                description: 'Enhanced features for growing practices',
                icon: 'zap',
                gradient: 'from-blue-500 to-indigo-600',
                sortOrder: 2,
                tiers: [
                    { name: "Silver", price: 1, coins: 50, active: true, features: ["Basic Analytics", "Email Support", "5 Case Templates", "Client Portal"], badgeColor: "#C0C0C0", glowColor: "rgba(192, 192, 192, 0.2)" },
                    { name: "Gold", price: 1000, coins: 100, active: true, features: ["Advanced Analytics", "Priority Support", "15 Case Templates", "Custom Branding"], badgeColor: "#FFD700", glowColor: "rgba(255, 215, 0, 0.2)", popular: true },
                    { name: "Platinum", price: 1500, coins: 150, active: true, features: ["Full Analytics Suite", "24/7 Support", "Unlimited Templates", "API Access"], badgeColor: "#E5E4E2", glowColor: "rgba(229, 228, 226, 0.2)" }
                ]
            },
            {
                memberType: 'advocate',
                name: 'Pro',
                description: 'Advanced tools for established professionals',
                icon: 'crown',
                gradient: 'from-purple-500 to-pink-600',
                sortOrder: 3,
                featured: true,
                tiers: [
                    { name: "Silver", price: 5000, coins: 500, active: true, features: ["AI Case Analysis", "Team Collaboration", "Custom Reports", "White Label"], badgeColor: "#C0C0C0", glowColor: "rgba(192, 192, 192, 0.3)" },
                    { name: "Gold", price: 10000, coins: 1000, active: true, features: ["AI + Human Review", "API Access", "Advanced Security", "Dedicated Manager"], badgeColor: "#FFD700", glowColor: "rgba(255, 215, 0, 0.3)", popular: true },
                    { name: "Platinum", price: 15000, coins: 1500, active: true, features: ["Enterprise Solutions", "Custom Development", "SLA Guarantee", "Priority Support"], badgeColor: "#E5E4E2", glowColor: "rgba(229, 228, 226, 0.3)" }
                ]
            },
            {
                memberType: 'advocate',
                name: 'Ultra Pro',
                description: 'Elite suite for top-tier law firms',
                icon: 'gem',
                gradient: 'from-amber-400 to-orange-600',
                sortOrder: 4,
                tiers: [
                    { name: "Silver", price: 25000, coins: "unlimited", active: true, features: ["Unlimited Everything", "Personal Account Manager", "Custom AI Training", "Executive Dashboard"], badgeColor: "#C0C0C0", glowColor: "rgba(192, 192, 192, 0.3)" },
                    { name: "Gold", price: 35000, coins: "unlimited", active: true, features: ["All Silver Features", "Quarterly Strategy Sessions", "Market Analysis", "Dedicated Support Team"], badgeColor: "#FFD700", glowColor: "rgba(255, 215, 0, 0.3)", popular: true },
                    { name: "Platinum", price: 50000, coins: "unlimited", active: true, features: ["All Gold Features", "Custom Integrations", "Executive Training", "Guaranteed ROI", "Personal Butler Service"], badgeColor: "#E5E4E2", glowColor: "rgba(229, 228, 226, 0.3)" }
                ]
            },

            // CLIENT PACKAGES
            {
                memberType: 'client',
                name: 'Free',
                description: 'Standard access with essential features',
                icon: 'star',
                gradient: 'from-gray-500 to-gray-700',
                sortOrder: 1,
                tiers: [
                    {
                        name: 'Standard',
                        price: 0,
                        coins: 10,
                        active: true,
                        features: ["Basic Profile", "Limited Visibility", "Email Support"],
                        badgeColor: "#94a3b8",
                        glowColor: "rgba(148, 163, 184, 0.2)"
                    }
                ]
            },
            {
                memberType: 'client',
                name: 'Pro Lite',
                description: 'Enhanced features for growing needs',
                icon: 'zap',
                gradient: 'from-blue-500 to-indigo-600',
                sortOrder: 2,
                tiers: [
                    { name: "Silver", price: 1, coins: 50, active: true, features: ["Basic Analytics", "Email Support", "5 Legal Templates", "Advocate Portal"], badgeColor: "#C0C0C0", glowColor: "rgba(192, 192, 192, 0.2)" },
                    { name: "Gold", price: 1000, coins: 100, active: true, features: ["Advanced Analytics", "Priority Support", "15 Legal Templates", "Custom Dashboard"], badgeColor: "#FFD700", glowColor: "rgba(255, 215, 0, 0.2)", popular: true },
                    { name: "Platinum", price: 1500, coins: 150, active: true, features: ["Full Analytics Suite", "24/7 Support", "Unlimited Templates", "Priority Matching"], badgeColor: "#E5E4E2", glowColor: "rgba(229, 228, 226, 0.2)" }
                ]
            },
            {
                memberType: 'client',
                name: 'Pro',
                description: 'Advanced tools for established clients',
                icon: 'crown',
                gradient: 'from-purple-500 to-pink-600',
                sortOrder: 3,
                featured: true,
                tiers: [
                    { name: "Silver", price: 5000, coins: 500, active: true, features: ["AI Legal Assistant", "Case Management", "Custom Reports", "Priority Access"], badgeColor: "#C0C0C0", glowColor: "rgba(192, 192, 192, 0.3)" },
                    { name: "Gold", price: 10000, coins: 1000, active: true, features: ["AI + Expert Review", "Multi-Case Management", "Advanced Security", "Dedicated Support"], badgeColor: "#FFD700", glowColor: "rgba(255, 215, 0, 0.3)", popular: true },
                    { name: "Platinum", price: 15000, coins: 1500, active: true, features: ["Enterprise Solutions", "Custom Integration", "SLA Guarantee", "VIP Support"], badgeColor: "#E5E4E2", glowColor: "rgba(229, 228, 226, 0.3)" }
                ]
            }
        ];

        await Package.insertMany(packages);
        console.log(`Successfully seeded ${packages.length} packages!`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding packages:', err);
        process.exit(1);
    }
}

seedPackages();
