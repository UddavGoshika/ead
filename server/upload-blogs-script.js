const mongoose = require('mongoose');
const Blog = require('./models/Blog');
require('dotenv').config();

const sliderImages = [
    {
        src: "/assets/fil4.jpeg",
        title: "Search by Party Name",
        subtitle: "Find your case status using the petitioner or respondent name.",
        btnLink: "https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/index"
    },
    {
        src: "/assets/fil3.jpeg",
        title: "Case Status",
        subtitle: "Access detailed case status using your case number or filing number as registered with the court.",
        btnLink: "https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/index"
    },
    {
        src: "/assets/fil2.jpeg",
        title: "File a Case",
        subtitle: "Locate case information using advocate name, FIR number, or applicable act where supported.",
        btnLink: "https://services.ecourts.gov.in/ecourtindia_v6/"
    },
    {
        src: "/assets/fil1.jpeg",
        title: "Search by CNR Number",
        subtitle: "Track case information using the unique Case Number Record (CNR).",
        btnLink: "https://services.ecourts.gov.in/ecourtindia_v6/"
    },
    {
        src: "https://github.com/BOINISRIHARI/100pages/blob/main/2.png?raw=true",
        title: "E-filing Services Sign In",
        subtitle: "Find your case status using the petitioner or respondent name.",
        btnLink: "https://services.ecourts.gov.in/ecourtindia_v6/"
    },
    {
        src: "https://github.com/BOINISRIHARI/100pages/blob/main/3.png?raw=true",
        title: "Advocate Registration Flow",
        subtitle: "Access detailed case status using your case or filing number.",
        btnLink: "https://services.ecourts.gov.in/ecourtindia_v6/"
    },
    {
        src: "https://github.com/BOINISRIHARI/100pages/blob/main/4.png?raw=true",
        title: "Register New User",
        subtitle: "Locate case information using advocate name or FIR number.",
        btnLink: "https://services.ecourts.gov.in/ecourtindia_v6/"
    },
    {
        src: "https://github.com/BOINISRIHARI/100pages/blob/main/5.png?raw=true",
        title: "Litigant Registration Flow",
        subtitle: "Locate case information using advocate name or FIR number.",
        btnLink: "https://services.ecourts.gov.in/ecourtindia_v6/"
    },
    {
        src: "https://github.com/BOINISRIHARI/100pages/blob/main/6.png?raw=true",
        title: "User Registration Success Message",
        subtitle: "Locate case information using advocate name or FIR number.",
        btnLink: "https://services.ecourts.gov.in/ecourtindia_v6/"
    },
    {
        src: "https://github.com/BOINISRIHARI/100pages/blob/main/7.png?raw=true",
        title: "Forgot Password ",
        subtitle: "Locate case information using advocate name or FIR number.",
        btnLink: "https://services.ecourts.gov.in/ecourtindia_v6/"
    },
    {
        src: "https://github.com/BOINISRIHARI/100pages/blob/main/8.png?raw=true",
        title: "Change Password",
        subtitle: "Locate case information using advocate name or FIR number.",
        btnLink: "https://services.ecourts.gov.in/ecourtindia_v6/"
    }
];

const AUTHOR_ID = '697a6d17c535a870f2e77d7a';
const AUTHOR_NAME = 'e-Advocate Services';

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Database');

        // Optional: clear existing blogs if you want a clean start
        // await Blog.deleteMany({ authorName: AUTHOR_NAME });

        const blogsToInsert = sliderImages.map(slide => ({
            title: slide.title,
            content: `${slide.subtitle}\n\nLearn more at: ${slide.btnLink}`,
            author: AUTHOR_ID,
            authorName: AUTHOR_NAME,
            category: 'Guide',
            image: slide.src.startsWith('/') ? `https://eadvocate.in${slide.src}` : slide.src, // Adjust default base URL if needed
            status: 'Approved'
        }));

        await Blog.insertMany(blogsToInsert);
        console.log(`Successfully uploaded ${blogsToInsert.length} blogs!`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding blogs:', err);
        process.exit(1);
    }
}

seed();
