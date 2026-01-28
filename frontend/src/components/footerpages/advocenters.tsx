import React, { useState } from "react";
import styles from "./advcenters.module.css";

/* ================= TYPES ================= */
type StateName = keyof typeof stateImages;

type DataMap = {
    [state: string]: {
        [district: string]: string[];
    };
};

/* ================= STATE IMAGES ================= */
const stateImages: Record<string, string> = {

    "Andhra Pradesh": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/andhrapradesh.png",
    "Arunachal Pradesh": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Arunachal%20Pradesh%202.jpg",
    "Assam": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/assam%202.jpg",
    "Bihar": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/bihar.jpeg",
    "Chhattisgarh": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Chhattisgarh%202.jpg",
    "Goa": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/goa%202.jpg",
    "Gujarat": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Gujarat%202.jpg",
    "Haryana": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Haryana%202.jpg",
    "Himachal Pradesh": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Himachal%20Pradesh%202.jpg",
    "Jharkhand": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Jharkhand%202.jpg",
    "Karnataka": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Karnataka2.jpg",
    "Kerala": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Kerala%202.jpg",
    "Madhya Pradesh": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Madhya%20Pradesh%202.jpg",
    "Maharashtra": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Maharastra%202.jpg",
    "Manipur": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Manipur.png",
    "Meghalaya": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Meghalaya.jpeg",
    "Mizoram": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Mizoram%202.jpg",
    "Nagaland": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Nagaland%202.jpg",
    "Odisha": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Odisha%202.jpg",
    "Punjab": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Punjab%202.jpg",
    "Rajasthan": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Rajasthan%202.jpg",
    "Sikkim": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Sikkim%202.jpg",
    "Tamil Nadu": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Tamil%20Nadu%202.jpg",
    "Telangana": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/telangana.png",
    "Tripura": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Tripura%202.jpg",
    "Uttar Pradesh": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Uttar%20Pradesh%202.jpg",
    "Uttarakhand": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Uttarakhand_Divisions_Map.png",
    "West Bengal": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/West%20Bengal%202.jpg",

    "Andaman and Nicobar Islands": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Andaman%20and%20Nicobar%20Islands%202.jpg",
    "Chandigarh": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Chandigarh%202.jpg",
    "Dadra and Nagar Haveli and Daman and Diu": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Dadra%20and%20Nagar%20Haveli%20and%20Daman%20and%20Diu%202.jpg",
    "Delhi": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Delhi%203.jpg",
    "Jammu and Kashmir": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Jammu%20and%20Kashmir%203.jpg",
    "Ladakh": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Ladakh%202.jpg",
    "Lakshadweep": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Lakshadweep%202.jpg",
    "Puducherry": "https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/Puducherry%202.jpg"
};

/* ================= SAMPLE DATA (REPLACE WITH REAL) ================= */
const data: DataMap = {
    "Andhra Pradesh": {
        "Alluri Sitharama Raju": ["Paderu", "Araku Valley", "Chintapalle"],
        "Anakapalli": ["Anakapalle", "Elamanchili", "Narsipatnam"],
        "Annamayya": ["Rayachoti", "Madanapalle", "Rajampet"],
        "Bapatla": ["Bapatla", "Chirala", "Repalle"],
        "Chittoor": ["Chittoor", "Palamaner", "Nagari"],
        "Dr. B.R. Ambedkar Konaseema": ["Amalapuram", "Razole", "Mummidivaram"],
        "East Godavari": ["Rajamahendravaram", "Mandapeta", "Rajanagaram"],
        "Eluru": ["Eluru", "Nuzvid", "Jangareddygudem"],
        "Guntur": ["Guntur", "Tenali", "Mangalagiri"],
        "Kakinada": ["Kakinada", "Samalkota", "Peddapuram"],
        "Krishna": ["Vijayawada", "Machilipatnam", "Gudivada"],
        "Kurnool": ["Kurnool", "Adoni", "Yemmiganur"],
        "Markapuram": ["Markapuram", "Yerragondapalem", "Dornala"],
        "Nandyal": ["Nandyal", "Banaganapalle", "Atmakur"],
        "NTR": ["Vijayawada", "Nandigama", "Jaggayyapeta"],
        "Palnadu": ["Narasaraopet", "Piduguralla", "Sattenapalle"],
        "Parvathipuram Manyam": ["Parvathipuram", "Salur", "Kurupam"],
        "Polavaram": ["Polavaram", "Buttayagudem", "Gopalapuram"],
        "Prakasam": ["Ongole", "Chirala", "Kandukur"],
        "Satya Sai": ["Puttaparthi", "Dharmavaram", "Hindupur"],
        "Sri Balaji": ["Tirupati", "Srikalahasti", "Renigunta"],
        "Srikakulam": ["Srikakulam", "Palasa", "Amadalavalasa"],
        "Tirupati": ["Tirupati", "Chandragiri", "Srikalahasti"],
        "Visakhapatnam": ["Visakhapatnam", "Bheemunipatnam", "Anakapalle"],
        "Vizianagaram": ["Vizianagaram", "Bobbili", "Cheepurupalli"],
        "West Godavari": ["Bhimavaram", "Tadepalligudem", "Narasapuram"],
        "YSR Kadapa": ["Kadapa", "Proddatur", "Pulivendula"]
    },

    "Arunachal Pradesh": {
        "Anjaw": ["Hawai"],
        "Changlang": ["Changlang", "Jairampur"],
        "Dibang Valley": ["Anini"],
        "East Kameng": ["Seppa"],
        "East Siang": ["Pasighat"],
        "Kamle": ["Raga"],
        "Kra Daadi": ["Palin"],
        "Kurung Kumey": ["Koloriang"],
        "Lepa Rada": ["Basar"],
        "Lohit": ["Tezu"],
        "Longding": ["Longding"],
        "Lower Dibang Valley": ["Roing"],
        "Lower Siang": ["Likabali"],
        "Lower Subansiri": ["Ziro"],
        "Namsai": ["Namsai"],
        "Pakke Kessang": ["Lemmi"],
        "Papum Pare": ["Yupia", "Doimukh"],
        "Shi Yomi": ["Tato"],
        "Siang": ["Boleng"],
        "Tawang": ["Tawang"],
        "Tirap": ["Khonsa"],
        "Upper Siang": ["Yingkiong"],
        "Upper Subansiri": ["Daporijo"],
        "West Kameng": ["Bomdila"],
        "West Siang": ["Aalo"],
        "Itanagar Capital Complex": ["Itanagar", "Naharlagun"]
    },

    "Assam": {
        "Bajali": ["Pathsala"],
        "Baksa": ["Mushalpur"],
        "Barpeta": ["Barpeta", "Howly"],
        "Biswanath": ["Biswanath Chariali"],
        "Bongaigaon": ["Bongaigaon"],
        "Cachar": ["Silchar"],
        "Charaideo": ["Sonari"],
        "Chirang": ["Kajalgaon"],
        "Darrang": ["Mangaldoi"],
        "Dhemaji": ["Dhemaji"],
        "Dhubri": ["Dhubri"],
        "Dibrugarh": ["Dibrugarh"],
        "Goalpara": ["Goalpara"],
        "Golaghat": ["Golaghat"],
        "Hailakandi": ["Hailakandi"],
        "Hojai": ["Hojai"],
        "Jorhat": ["Jorhat"],
        "Kamrup": ["Rangia"],
        "Kamrup Metropolitan": ["Guwahati"],
        "Karbi Anglong": ["Diphu"],
        "Karimganj": ["Karimganj"],
        "Kokrajhar": ["Kokrajhar"],
        "Lakhimpur": ["North Lakhimpur"],
        "Majuli": ["Garamur"],
        "Morigaon": ["Morigaon"],
        "Nagaon": ["Nagaon"],
        "Nalbari": ["Nalbari"],
        "Sivasagar": ["Sivasagar"],
        "Sonitpur": ["Tezpur"],
        "South Salmara-Mankachar": ["Hatsingimari"],
        "Tinsukia": ["Tinsukia"],
        "Udalguri": ["Udalguri"],
        "West Karbi Anglong": ["Hamren"]
    },
    "Bihar": {
        "Araria": ["Araria", "Forbesganj", "Jokihat"],
        "Arwal": ["Arwal", "Kaler"],
        "Aurangabad": ["Aurangabad", "Daudnagar", "Rafiganj"],
        "Banka": ["Banka", "Amarpur"],
        "Begusarai": ["Begusarai", "Barauni", "Teghra"],
        "Bhagalpur": ["Bhagalpur", "Naugachia", "Sabour"],
        "Bhojpur": ["Arrah", "Piro", "Jagdishpur"],
        "Buxar": ["Buxar", "Dumraon"],
        "Darbhanga": ["Darbhanga", "Hayaghat", "Benipur"],
        "East Champaran": ["Motihari", "Raxaul", "Chakia"],
        "Gaya": ["Gaya", "Tekari", "Sherghati"],
        "Gopalganj": ["Gopalganj", "Thawe"],
        "Jamui": ["Jamui", "Jhajha"],
        "Jehanabad": ["Jehanabad", "Makhdumpur"],
        "Kaimur": ["Bhabua", "Mohania"],
        "Katihar": ["Katihar", "Manihari", "Barsoi"],
        "Khagaria": ["Khagaria", "Gogri"],
        "Kishanganj": ["Kishanganj", "Bahadurganj"],
        "Lakhisarai": ["Lakhisarai", "Barahiya"],
        "Madhepura": ["Madhepura", "Bihariganj"],
        "Madhubani": ["Madhubani", "Jhanjharpur", "Benipatti"],
        "Munger": ["Munger", "Jamalpur"],
        "Muzaffarpur": ["Muzaffarpur", "Kanti", "Saraiya"],
        "Nalanda": ["Bihar Sharif", "Rajgir", "Harnaut"],
        "Nawada": ["Nawada", "Hisua"],
        "Patna": ["Patna", "Danapur", "Phulwari Sharif"],
        "Purnia": ["Purnia", "Banmankhi"],
        "Rohtas": ["Sasaram", "Dehri"],
        "Saharsa": ["Saharsa", "Simri Bakhtiarpur"],
        "Samastipur": ["Samastipur", "Dalsinghsarai"],
        "Saran": ["Chhapra", "Marhaura"],
        "Sheikhpura": ["Sheikhpura", "Barbigha"],
        "Sheohar": ["Sheohar", "Piprarhi"],
        "Sitamarhi": ["Sitamarhi", "Belsand"],
        "Siwan": ["Siwan", "Maharajganj"],
        "Supaul": ["Supaul", "Birpur"],
        "Vaishali": ["Hajipur", "Mahnar"],
        "West Champaran": ["Bettiah", "Narkatiaganj"]
    },

    "Chhattisgarh": {
        "Balod": ["Balod", "Dondi"],
        "Baloda Bazar": ["Baloda Bazar", "Bhatapara"],
        "Balrampur": ["Balrampur", "Rajpur"],
        "Bastar": ["Jagdalpur", "Kondagaon"],
        "Bemetara": ["Bemetara", "Saja"],
        "Bijapur": ["Bijapur", "Bhairamgarh"],
        "Bilaspur": ["Bilaspur", "Takhatpur"],
        "Dantewada": ["Dantewada", "Gidam"],
        "Dhamtari": ["Dhamtari", "Kurud"],
        "Durg": ["Durg", "Bhilai"],
        "Gariaband": ["Gariaband", "Rajim"],
        "Janjgir-Champa": ["Janjgir", "Champa"],
        "Jashpur": ["Jashpur Nagar", "Pathalgaon"],
        "Kabirdham": ["Kawardha", "Pandariya"],
        "Kanker": ["Kanker", "Antagarh"],
        "Kondagaon": ["Kondagaon", "Makdi"],
        "Korba": ["Korba", "Katghora"],
        "Korea": ["Baikunthpur", "Manendragarh"],
        "Mahasamund": ["Mahasamund", "Pithora"],
        "Mungeli": ["Mungeli", "Lormi"],
        "Narayanpur": ["Narayanpur", "Orchha"],
        "Raigarh": ["Raigarh", "Kharsia"],
        "Raipur": ["Raipur", "Arang"],
        "Rajnandgaon": ["Rajnandgaon", "Dongargarh"],
        "Sukma": ["Sukma", "Kontaa"],
        "Surajpur": ["Surajpur", "Pratappur"],
        "Surguja": ["Ambikapur", "Sitapur"]
    },

    "Goa": {
        "North Goa": ["Panaji", "Mapusa", "Pernem"],
        "South Goa": ["Margao", "Vasco da Gama", "Canacona"]
    },

    "Gujarat": {
        "Ahmedabad": ["Ahmedabad", "Sanand", "Dholka"],
        "Amreli": ["Amreli", "Savarkundla"],
        "Anand": ["Anand", "Petlad"],
        "Aravalli": ["Modasa", "Bayad"],
        "Banaskantha": ["Palanpur", "Deesa"],
        "Bharuch": ["Bharuch", "Ankleshwar"],
        "Bhavnagar": ["Bhavnagar", "Mahuva"],
        "Botad": ["Botad", "Gadhada"],
        "Chhota Udaipur": ["Chhota Udaipur", "Bodeli"],
        "Dahod": ["Dahod", "Limkheda"],
        "Dang": ["Ahwa"],
        "Devbhoomi Dwarka": ["Dwarka", "Khambhalia"],
        "Gandhinagar": ["Gandhinagar", "Kalol"],
        "Gir Somnath": ["Veraval", "Kodinar"],
        "Jamnagar": ["Jamnagar", "Dhrol"],
        "Junagadh": ["Junagadh", "Keshod"],
        "Kheda": ["Nadiad", "Kapadvanj"],
        "Kutch": ["Bhuj", "Gandhidham"],
        "Mahisagar": ["Lunawada", "Balasinor"],
        "Mehsana": ["Mehsana", "Visnagar"],
        "Morbi": ["Morbi", "Wankaner"],
        "Narmada": ["Rajpipla"],
        "Navsari": ["Navsari", "Bilimora"],
        "Panchmahal": ["Godhra", "Halol"],
        "Patan": ["Patan", "Sidhpur"],
        "Porbandar": ["Porbandar", "Kutiyana"],
        "Rajkot": ["Rajkot", "Gondal"],
        "Sabarkantha": ["Himmatnagar", "Idar"],
        "Surat": ["Surat", "Bardoli"],
        "Surendranagar": ["Surendranagar", "Wadhwan"],
        "Tapi": ["Vyara"],
        "Vadodara": ["Vadodara", "Padra"],
        "Valsad": ["Valsad", "Vapi"]
    },

    "Haryana": {
        "Ambala": ["Ambala", "Naraingarh"],
        "Bhiwani": ["Bhiwani", "Loharu"],
        "Charkhi Dadri": ["Charkhi Dadri", "Badhra"],
        "Faridabad": ["Faridabad", "Ballabhgarh"],
        "Fatehabad": ["Fatehabad", "Tohana"],
        "Gurugram": ["Gurugram", "Sohna"],
        "Hisar": ["Hisar", "Hansi"],
        "Jhajjar": ["Jhajjar", "Bahadurgarh"],
        "Jind": ["Jind", "Narwana"],
        "Kaithal": ["Kaithal", "Guhla"],
        "Karnal": ["Karnal", "Assandh"],
        "Kurukshetra": ["Thanesar", "Pehowa"],
        "Mahendragarh": ["Narnaul", "Mahendragarh"],
        "Nuh": ["Nuh", "Punhana"],
        "Palwal": ["Palwal", "Hodal"],
        "Panchkula": ["Panchkula", "Kalka"],
        "Panipat": ["Panipat", "Samalkha"],
        "Rewari": ["Rewari", "Bawal"],
        "Rohtak": ["Rohtak", "Meham"],
        "Sirsa": ["Sirsa", "Ellenabad"],
        "Sonipat": ["Sonipat", "Gohana"],
        "Yamunanagar": ["Yamunanagar", "Jagadhri"]
    },

    "Himachal Pradesh": {
        "Bilaspur": ["Bilaspur", "Ghumarwin"],
        "Chamba": ["Chamba", "Dalhousie"],
        "Hamirpur": ["Hamirpur", "Nadaun"],
        "Kangra": ["Dharamshala", "Palampur"],
        "Kinnaur": ["Reckong Peo"],
        "Kullu": ["Kullu", "Manali"],
        "Lahaul and Spiti": ["Keylong"],
        "Mandi": ["Mandi", "Sundernagar"],
        "Shimla": ["Shimla", "Rohru"],
        "Sirmaur": ["Nahan", "Paonta Sahib"],
        "Solan": ["Solan", "Nalagarh"],
        "Una": ["Una", "Amb"]
    },

    "Jharkhand": {
        "Bokaro": ["Bokaro Steel City", "Chandrapura"],
        "Chatra": ["Chatra", "Hunterganj"],
        "Deoghar": ["Deoghar", "Madhupur"],
        "Dhanbad": ["Dhanbad", "Jharia"],
        "Dumka": ["Dumka", "Jamtara"],
        "East Singhbhum": ["Jamshedpur", "Ghatshila"],
        "Garhwa": ["Garhwa", "Nagar Untari"],
        "Giridih": ["Giridih", "Jamua"],
        "Godda": ["Godda", "Mahagama"],
        "Gumla": ["Gumla", "Sisai"],
        "Hazaribagh": ["Hazaribagh", "Barhi"],
        "Jamtara": ["Jamtara", "Nala"],
        "Khunti": ["Khunti", "Tamar"],
        "Koderma": ["Koderma", "Jhumri Telaiya"],
        "Latehar": ["Latehar", "Barwadih"],
        "Lohardaga": ["Lohardaga", "Kisko"],
        "Pakur": ["Pakur", "Hiranpur"],
        "Palamu": ["Medininagar", "Hussainabad"],
        "Ramgarh": ["Ramgarh", "Patratu"],
        "Ranchi": ["Ranchi", "Bundu"],
        "Sahibganj": ["Sahibganj", "Rajmahal"],
        "Seraikela Kharsawan": ["Seraikela", "Chandil"],
        "Simdega": ["Simdega", "Kolebira"],
        "West Singhbhum": ["Chaibasa", "Chakradharpur"]
    },
    "Karnataka": {
        "Bagalkot": ["Bagalkot", "Jamkhandi"],
        "Ballari": ["Ballari", "Hospet"],
        "Belagavi": ["Belagavi", "Gokak"],
        "Bengaluru Rural": ["Devanahalli", "Doddaballapur"],
        "Bengaluru Urban": ["Bengaluru", "Yelahanka", "Whitefield"],
        "Bidar": ["Bidar", "Basavakalyan"],
        "Chamarajanagar": ["Chamarajanagar", "Gundlupet"],
        "Chikkaballapur": ["Chikkaballapur", "Gauribidanur"],
        "Chikkamagaluru": ["Chikkamagaluru", "Kadur"],
        "Chitradurga": ["Chitradurga", "Hiriyur"],
        "Dakshina Kannada": ["Mangaluru", "Puttur"],
        "Davangere": ["Davangere", "Harihar"],
        "Dharwad": ["Dharwad", "Hubballi"],
        "Gadag": ["Gadag", "Mundargi"],
        "Hassan": ["Hassan", "Arsikere"],
        "Haveri": ["Haveri", "Ranebennur"],
        "Kalaburagi": ["Kalaburagi", "Aland"],
        "Kodagu": ["Madikeri", "Virajpet"],
        "Kolar": ["Kolar", "Malur"],
        "Koppal": ["Koppal", "Gangavati"],
        "Mandya": ["Mandya", "Maddur"],
        "Mysuru": ["Mysuru", "Nanjangud"],
        "Raichur": ["Raichur", "Sindhanur"],
        "Ramanagara": ["Ramanagara", "Channapatna"],
        "Shivamogga": ["Shivamogga", "Bhadravati"],
        "Tumakuru": ["Tumakuru", "Tiptur"],
        "Udupi": ["Udupi", "Kundapura"],
        "Uttara Kannada": ["Karwar", "Sirsi"],
        "Vijayanagara": ["Hospet", "Kudligi"],
        "Vijayapura": ["Vijayapura", "Indi"],
        "Yadgir": ["Yadgir", "Shorapur"]
    },

    "Kerala": {
        "Alappuzha": ["Alappuzha", "Kayamkulam"],
        "Ernakulam": ["Kochi", "Aluva"],
        "Idukki": ["Thodupuzha", "Munnar"],
        "Kannur": ["Kannur", "Taliparamba"],
        "Kasaragod": ["Kasaragod", "Kanhangad"],
        "Kollam": ["Kollam", "Punalur"],
        "Kottayam": ["Kottayam", "Changanassery"],
        "Kozhikode": ["Kozhikode", "Vadakara"],
        "Malappuram": ["Malappuram", "Tirur"],
        "Palakkad": ["Palakkad", "Ottapalam"],
        "Pathanamthitta": ["Pathanamthitta", "Adoor"],
        "Thiruvananthapuram": ["Thiruvananthapuram", "Neyyattinkara"],
        "Thrissur": ["Thrissur", "Irinjalakuda"],
        "Wayanad": ["Kalpetta", "Mananthavady"]
    },

    "Madhya Pradesh": {
        "Agar Malwa": ["Agar"],
        "Alirajpur": ["Alirajpur", "Jobat"],
        "Anuppur": ["Anuppur", "Kotma"],
        "Ashoknagar": ["Ashoknagar", "Chanderi"],
        "Balaghat": ["Balaghat", "Baihar"],
        "Barwani": ["Barwani", "Sendhwa"],
        "Betul": ["Betul", "Multai"],
        "Bhind": ["Bhind", "Gohad"],
        "Bhopal": ["Bhopal", "Berasia"],
        "Burhanpur": ["Burhanpur", "Nepanagar"],
        "Chhatarpur": ["Chhatarpur", "Nowgong"],
        "Chhindwara": ["Chhindwara", "Pandhurna"],
        "Damoh": ["Damoh", "Patharia"],
        "Datia": ["Datia", "Bhander"],
        "Dewas": ["Dewas", "Bagli"],
        "Dhar": ["Dhar", "Manawar"],
        "Dindori": ["Dindori", "Shahpura"],
        "Guna": ["Guna", "Raghogarh"],
        "Gwalior": ["Gwalior", "Dabra"],
        "Harda": ["Harda", "Timarni"],
        "Hoshangabad": ["Itarsi", "Pipariya"],
        "Indore": ["Indore", "Mhow"],
        "Jabalpur": ["Jabalpur", "Patan"],
        "Jhabua": ["Jhabua", "Thandla"],
        "Katni": ["Katni", "Vijayraghavgarh"],
        "Khandwa": ["Khandwa", "Pandhana"],
        "Khargone": ["Khargone", "Sanawad"],
        "Mandla": ["Mandla", "Nainpur"],
        "Mandsaur": ["Mandsaur", "Garoth"],
        "Morena": ["Morena", "Ambah"],
        "Narmadapuram": ["Hoshangabad", "Babai"],
        "Neemuch": ["Neemuch", "Manasa"],
        "Narsinghpur": ["Narsinghpur", "Gadarwara"],
        "Panna": ["Panna", "Ajaigarh"],
        "Raisen": ["Raisen", "Bareli"],
        "Rajgarh": ["Rajgarh", "Biaora"],
        "Ratlam": ["Ratlam", "Jaora"],
        "Rewa": ["Rewa", "Mauganj"],
        "Sagar": ["Sagar", "Bina"],
        "Satna": ["Satna", "Maihar"],
        "Sehore": ["Sehore", "Ashta"],
        "Seoni": ["Seoni", "Lakhnadon"],
        "Shahdol": ["Shahdol", "Burhar"],
        "Shajapur": ["Shajapur", "Agar"],
        "Sheopur": ["Sheopur", "Vijaypur"],
        "Shivpuri": ["Shivpuri", "Pichhore"],
        "Sidhi": ["Sidhi", "Churhat"],
        "Singrauli": ["Singrauli", "Waidhan"],
        "Tikamgarh": ["Tikamgarh", "Niwari"],
        "Ujjain": ["Ujjain", "Nagda"],
        "Umaria": ["Umaria", "Pali"],
        "Vidisha": ["Vidisha", "Basoda"]
    },

    "Maharashtra": {
        "Ahmednagar": ["Ahmednagar", "Shrirampur"],
        "Akola": ["Akola", "Akot"],
        "Amravati": ["Amravati", "Badnera"],
        "Aurangabad": ["Aurangabad", "Paithan"],
        "Beed": ["Beed", "Georai"],
        "Bhandara": ["Bhandara", "Tumsar"],
        "Buldhana": ["Buldhana", "Khamgaon"],
        "Chandrapur": ["Chandrapur", "Ballarpur"],
        "Dhule": ["Dhule", "Shirpur"],
        "Gadchiroli": ["Gadchiroli", "Aheri"],
        "Gondia": ["Gondia", "Tirora"],
        "Hingoli": ["Hingoli", "Kalamnuri"],
        "Jalgaon": ["Jalgaon", "Bhusawal"],
        "Jalna": ["Jalna", "Partur"],
        "Kolhapur": ["Kolhapur", "Ichalkaranji"],
        "Latur": ["Latur", "Udgir"],
        "Mumbai City": ["Mumbai"],
        "Mumbai Suburban": ["Andheri", "Borivali"],
        "Nagpur": ["Nagpur", "Katol"],
        "Nanded": ["Nanded", "Deglur"],
        "Nandurbar": ["Nandurbar", "Shahada"],
        "Nashik": ["Nashik", "Malegaon"],
        "Osmanabad": ["Osmanabad", "Tuljapur"],
        "Palghar": ["Palghar", "Vasai"],
        "Parbhani": ["Parbhani", "Manwath"],
        "Pune": ["Pune", "Baramati"],
        "Raigad": ["Alibag", "Panvel"],
        "Ratnagiri": ["Ratnagiri", "Chiplun"],
        "Sangli": ["Sangli", "Miraj"],
        "Satara": ["Satara", "Karad"],
        "Sindhudurg": ["Sawantwadi", "Kudal"],
        "Solapur": ["Solapur", "Pandharpur"],
        "Thane": ["Thane", "Kalyan"],
        "Wardha": ["Wardha", "Hinganghat"],
        "Washim": ["Washim", "Karanja"],
        "Yavatmal": ["Yavatmal", "Pusad"]
    },

    "Manipur": {
        "Bishnupur": ["Bishnupur", "Nambol"],
        "Chandel": ["Chandel", "Moreh"],
        "Churachandpur": ["Churachandpur"],
        "Imphal East": ["Porompat"],
        "Imphal West": ["Imphal"],
        "Jiribam": ["Jiribam"],
        "Kakching": ["Kakching"],
        "Kamjong": ["Kamjong"],
        "Kangpokpi": ["Kangpokpi"],
        "Noney": ["Noney"],
        "Pherzawl": ["Pherzawl"],
        "Senapati": ["Senapati"],
        "Tamenglong": ["Tamenglong"],
        "Tengnoupal": ["Tengnoupal"],
        "Thoubal": ["Thoubal"],
        "Ukhrul": ["Ukhrul"]
    },

    "Meghalaya": {
        "East Garo Hills": ["Williamnagar"],
        "East Jaintia Hills": ["Khliehriat"],
        "East Khasi Hills": ["Shillong"],
        "Eastern West Khasi Hills": ["Mairang"],
        "North Garo Hills": ["Resubelpara"],
        "Ri-Bhoi": ["Nongpoh"],
        "South Garo Hills": ["Baghmara"],
        "South West Garo Hills": ["Ampati"],
        "South West Khasi Hills": ["Mawkyrwat"],
        "West Garo Hills": ["Tura"],
        "West Jaintia Hills": ["Jowai"],
        "West Khasi Hills": ["Nongstoin"]
    },

    "Mizoram": {
        "Aizawl": ["Aizawl"],
        "Champhai": ["Champhai"],
        "Hnahthial": ["Hnahthial"],
        "Khawzawl": ["Khawzawl"],
        "Kolasib": ["Kolasib"],
        "Lawngtlai": ["Lawngtlai"],
        "Lunglei": ["Lunglei"],
        "Mamit": ["Mamit"],
        "Saiha": ["Saiha"],
        "Saitual": ["Saitual"],
        "Serchhip": ["Serchhip"]
    },

    "Nagaland": {
        "Chümoukedima": ["Chümoukedima"],
        "Dimapur": ["Dimapur"],
        "Kiphire": ["Kiphire"],
        "Kohima": ["Kohima"],
        "Longleng": ["Longleng"],
        "Mokokchung": ["Mokokchung"],
        "Mon": ["Mon"],
        "Niuland": ["Niuland"],
        "Noklak": ["Noklak"],
        "Peren": ["Peren"],
        "Phek": ["Phek"],
        "Shamator": ["Shamator"],
        "Tseminyü": ["Tseminyü"],
        "Tuensang": ["Tuensang"],
        "Wokha": ["Wokha"],
        "Zunheboto": ["Zunheboto"]
    },

    "Odisha": {
        "Angul": ["Angul", "Talcher"],
        "Balangir": ["Balangir", "Titlagarh"],
        "Balasore": ["Balasore", "Jaleswar"],
        "Bargarh": ["Bargarh", "Padampur"],
        "Bhadrak": ["Bhadrak", "Basudevpur"],
        "Boudh": ["Boudh"],
        "Cuttack": ["Cuttack", "Choudwar"],
        "Deogarh": ["Deogarh"],
        "Dhenkanal": ["Dhenkanal", "Kamakhyanagar"],
        "Gajapati": ["Paralakhemundi"],
        "Ganjam": ["Berhampur", "Chhatrapur"],
        "Jagatsinghpur": ["Jagatsinghpur", "Paradip"],
        "Jajpur": ["Jajpur", "Vyasanagar"],
        "Jharsuguda": ["Jharsuguda", "Belpahar"],
        "Kalahandi": ["Bhawanipatna", "Junagarh"],
        "Kandhamal": ["Phulbani"],
        "Kendrapara": ["Kendrapara", "Pattamundai"],
        "Kendujhar": ["Keonjhar", "Barbil"],
        "Khordha": ["Bhubaneswar", "Jatni"],
        "Koraput": ["Koraput", "Jeypore"],
        "Malkangiri": ["Malkangiri"],
        "Mayurbhanj": ["Baripada", "Rairangpur"],
        "Nabarangpur": ["Nabarangpur"],
        "Nayagarh": ["Nayagarh"],
        "Nuapada": ["Nuapada", "Khariar"],
        "Puri": ["Puri", "Konark"],
        "Rayagada": ["Rayagada", "Gunupur"],
        "Sambalpur": ["Sambalpur", "Hirakud"],
        "Subarnapur": ["Sonepur"],
        "Sundargarh": ["Sundargarh", "Rourkela"]
    },

    "Punjab": {
        "Amritsar": ["Amritsar", "Ajnala"],
        "Barnala": ["Barnala"],
        "Bathinda": ["Bathinda", "Raman"],
        "Faridkot": ["Faridkot"],
        "Fatehgarh Sahib": ["Fatehgarh Sahib"],
        "Fazilka": ["Fazilka", "Abohar"],
        "Firozpur": ["Firozpur", "Zira"],
        "Gurdaspur": ["Gurdaspur", "Pathankot"],
        "Hoshiarpur": ["Hoshiarpur", "Mukerian"],
        "Jalandhar": ["Jalandhar", "Phillaur"],
        "Kapurthala": ["Kapurthala", "Phagwara"],
        "Ludhiana": ["Ludhiana", "Khanna"],
        "Malerkotla": ["Malerkotla"],
        "Mansa": ["Mansa", "Budhlada"],
        "Moga": ["Moga"],
        "Mohali": ["Mohali", "Kharar"],
        "Muktsar": ["Sri Muktsar Sahib"],
        "Pathankot": ["Pathankot"],
        "Patiala": ["Patiala", "Rajpura"],
        "Rupnagar": ["Rupnagar", "Anandpur Sahib"],
        "Sangrur": ["Sangrur", "Sunam"],
        "Shaheed Bhagat Singh Nagar": ["Nawanshahr"],
        "Tarn Taran": ["Tarn Taran"]
    },
    "Rajasthan": {
        "Ajmer": ["Ajmer", "Pushkar"],
        "Alwar": ["Alwar", "Behror"],
        "Anupgarh": ["Anupgarh"],
        "Balotra": ["Balotra"],
        "Banswara": ["Banswara"],
        "Baran": ["Baran"],
        "Barmer": ["Barmer"],
        "Beawar": ["Beawar"],
        "Bharatpur": ["Bharatpur", "Deeg"],
        "Bhilwara": ["Bhilwara"],
        "Bikaner": ["Bikaner"],
        "Bundi": ["Bundi"],
        "Chittorgarh": ["Chittorgarh"],
        "Churu": ["Churu", "Ratangarh"],
        "Dausa": ["Dausa"],
        "Deeg": ["Deeg"],
        "Dholpur": ["Dholpur"],
        "Didwana-Kuchaman": ["Didwana", "Kuchaman"],
        "Dungarpur": ["Dungarpur"],
        "Gangapur City": ["Gangapur City"],
        "Hanumangarh": ["Hanumangarh", "Sangaria"],
        "Jaipur": ["Jaipur"],
        "Jaipur Rural": ["Chomu", "Kotputli"],
        "Jaisalmer": ["Jaisalmer"],
        "Jalore": ["Jalore"],
        "Jhalawar": ["Jhalawar"],
        "Jhunjhunu": ["Jhunjhunu"],
        "Jodhpur": ["Jodhpur"],
        "Jodhpur Rural": ["Bilara"],
        "Karauli": ["Karauli"],
        "Kekri": ["Kekri"],
        "Kotputli-Behror": ["Kotputli", "Behror"],
        "Khairthal-Tijara": ["Tijara"],
        "Nagaur": ["Nagaur", "Ladnun"],
        "Neem ka Thana": ["Neem ka Thana"],
        "Pali": ["Pali"],
        "Phalodi": ["Phalodi"],
        "Pratapgarh": ["Pratapgarh"],
        "Rajsamand": ["Rajsamand", "Nathdwara"],
        "Salumbar": ["Salumbar"],
        "Sanchore": ["Sanchore"],
        "Sawai Madhopur": ["Sawai Madhopur"],
        "Sikar": ["Sikar"],
        "Sirohi": ["Sirohi", "Mount Abu"],
        "Sri Ganganagar": ["Sri Ganganagar"],
        "Tonk": ["Tonk"],
        "Udaipur": ["Udaipur"]
    },

    "Sikkim": {
        "Gangtok": ["Gangtok"],
        "Mangan": ["Mangan"],
        "Namchi": ["Namchi"],
        "Pakyong": ["Pakyong"],
        "Soreng": ["Soreng"],
        "Gyalshing": ["Gyalshing"]
    },

    "Tamil Nadu": {
        "Ariyalur": ["Ariyalur"],
        "Chengalpattu": ["Chengalpattu"],
        "Chennai": ["Chennai"],
        "Coimbatore": ["Coimbatore", "Pollachi"],
        "Cuddalore": ["Cuddalore", "Chidambaram"],
        "Dharmapuri": ["Dharmapuri"],
        "Dindigul": ["Dindigul", "Palani"],
        "Erode": ["Erode", "Gobichettipalayam"],
        "Kallakurichi": ["Kallakurichi"],
        "Kancheepuram": ["Kancheepuram"],
        "Kanniyakumari": ["Nagercoil"],
        "Karur": ["Karur"],
        "Krishnagiri": ["Krishnagiri", "Hosur"],
        "Madurai": ["Madurai"],
        "Mayiladuthurai": ["Mayiladuthurai"],
        "Nagapattinam": ["Nagapattinam"],
        "Namakkal": ["Namakkal"],
        "Nilgiris": ["Ooty", "Coonoor"],
        "Perambalur": ["Perambalur"],
        "Pudukkottai": ["Pudukkottai"],
        "Ramanathapuram": ["Ramanathapuram"],
        "Ranipet": ["Ranipet"],
        "Salem": ["Salem"],
        "Sivaganga": ["Sivaganga"],
        "Tenkasi": ["Tenkasi"],
        "Thanjavur": ["Thanjavur"],
        "Theni": ["Theni"],
        "Thoothukudi": ["Thoothukudi"],
        "Tiruchirappalli": ["Tiruchirappalli"],
        "Tirunelveli": ["Tirunelveli"],
        "Tirupathur": ["Tirupathur"],
        "Tiruppur": ["Tiruppur"],
        "Tiruvallur": ["Tiruvallur"],
        "Tiruvannamalai": ["Tiruvannamalai"],
        "Tiruvarur": ["Tiruvarur"],
        "Vellore": ["Vellore"],
        "Viluppuram": ["Viluppuram"],
        "Virudhunagar": ["Virudhunagar"]
    },

    "Telangana": {
        "Adilabad": ["Adilabad"],
        "Bhadradri Kothagudem": ["Kothagudem"],
        "Hanumakonda": ["Hanumakonda"],
        "Hyderabad": ["Hyderabad"],
        "Jagtial": ["Jagtial"],
        "Jangaon": ["Jangaon"],
        "Jayashankar Bhupalpally": ["Bhupalpally"],
        "Jogulamba Gadwal": ["Gadwal"],
        "Kamareddy": ["Kamareddy"],
        "Karimnagar": ["Karimnagar"],
        "Khammam": ["Khammam"],
        "Komaram Bheem Asifabad": ["Asifabad"],
        "Mahabubabad": ["Mahabubabad"],
        "Mahbubnagar": ["Mahbubnagar"],
        "Mancherial": ["Mancherial"],
        "Medak": ["Medak"],
        "Medchal-Malkajgiri": ["Medchal", "Malkajgiri"],
        "Mulugu": ["Mulugu"],
        "Nagarkurnool": ["Nagarkurnool"],
        "Nalgonda": ["Nalgonda"],
        "Narayanpet": ["Narayanpet"],
        "Nirmal": ["Nirmal"],
        "Nizamabad": ["Nizamabad"],
        "Peddapalli": ["Peddapalli"],
        "Rajanna Sircilla": ["Sircilla"],
        "Rangareddy": ["Shamshabad"],
        "Sangareddy": ["Sangareddy"],
        "Siddipet": ["Siddipet"],
        "Suryapet": ["Suryapet"],
        "Vikarabad": ["Vikarabad"],
        "Wanaparthy": ["Wanaparthy"],
        "Warangal": ["Warangal"],
        "Yadadri Bhuvanagiri": ["Bhongir"]
    },

    "Tripura": {
        "Dhalai": ["Ambassa"],
        "Gomati": ["Udaipur"],
        "Khowai": ["Khowai"],
        "North Tripura": ["Dharmanagar"],
        "Sepahijala": ["Bishramganj"],
        "South Tripura": ["Belonia"],
        "Unakoti": ["Kailashahar"],
        "West Tripura": ["Agartala"]
    },

    "Uttar Pradesh": {
        "Agra": ["Agra"],
        "Aligarh": ["Aligarh"],
        "Ayodhya": ["Ayodhya"],
        "Azamgarh": ["Azamgarh"],
        "Bareilly": ["Bareilly"],
        "Ghaziabad": ["Ghaziabad"],
        "Gorakhpur": ["Gorakhpur"],
        "Jhansi": ["Jhansi"],
        "Kanpur Nagar": ["Kanpur"],
        "Lucknow": ["Lucknow"],
        "Mathura": ["Mathura", "Vrindavan"],
        "Meerut": ["Meerut"],
        "Moradabad": ["Moradabad"],
        "Muzaffarnagar": ["Muzaffarnagar"],
        "Prayagraj": ["Prayagraj"],
        "Varanasi": ["Varanasi"]
    },

    "Uttarakhand": {
        "Almora": ["Almora"],
        "Bageshwar": ["Bageshwar"],
        "Chamoli": ["Gopeshwar"],
        "Champawat": ["Champawat"],
        "Dehradun": ["Dehradun"],
        "Haridwar": ["Haridwar"],
        "Nainital": ["Nainital", "Haldwani"],
        "Pauri Garhwal": ["Pauri"],
        "Pithoragarh": ["Pithoragarh"],
        "Rudraprayag": ["Rudraprayag"],
        "Tehri Garhwal": ["New Tehri"],
        "Udham Singh Nagar": ["Rudrapur"],
        "Uttarkashi": ["Uttarkashi"]
    },

    "West Bengal": {
        "Alipurduar": ["Alipurduar"],
        "Bankura": ["Bankura"],
        "Birbhum": ["Suri"],
        "Cooch Behar": ["Cooch Behar"],
        "Dakshin Dinajpur": ["Balurghat"],
        "Darjeeling": ["Darjeeling", "Kurseong"],
        "Hooghly": ["Chinsurah"],
        "Howrah": ["Howrah"],
        "Jalpaiguri": ["Jalpaiguri"],
        "Jhargram": ["Jhargram"],
        "Kalimpong": ["Kalimpong"],
        "Kolkata": ["Kolkata"],
        "Malda": ["Malda"],
        "Murshidabad": ["Baharampur"],
        "Nadia": ["Krishnanagar"],
        "North 24 Parganas": ["Barasat"],
        "Paschim Bardhaman": ["Durgapur", "Asansol"],
        "Paschim Medinipur": ["Medinipur"],
        "Purba Bardhaman": ["Bardhaman"],
        "Purba Medinipur": ["Tamluk"],
        "Purulia": ["Purulia"],
        "South 24 Parganas": ["Alipore"],
        "Uttar Dinajpur": ["Raiganj"]
    },

    "Andaman and Nicobar Islands": {
        "Nicobar": ["Car Nicobar", "Campbell Bay"],
        "North and Middle Andaman": ["Mayabunder", "Diglipur"],
        "South Andaman": ["Port Blair", "Ferrargunj"]
    },

    "Chandigarh": {
        "Chandigarh": ["Chandigarh"]
    },

    "Dadra and Nagar Haveli and Daman and Diu": {
        "Dadra and Nagar Haveli": ["Silvassa"],
        "Daman": ["Daman"],
        "Diu": ["Diu"]
    },

    "Delhi (NCT)": {
        "Central": ["Connaught Place", "Karol Bagh"],
        "Central North": ["Civil Lines"],
        "East": ["Preet Vihar", "Gandhi Nagar"],
        "New Delhi": ["New Delhi"],
        "North": ["Model Town", "Burari"],
        "North East": ["Seelampur", "Nand Nagri"],
        "North West": ["Rohini", "Pitampura"],
        "Old Delhi": ["Chandni Chowk"],
        "Shahdara": ["Shahdara", "Vivek Vihar"],
        "South": ["Saket", "Mehrauli"],
        "South East": ["Kalkaji", "Okhla"],
        "South West": ["Dwarka", "Najafgarh"],
        "West": ["Rajouri Garden", "Punjabi Bagh"]
    },

    "Jammu and Kashmir": {
        "Anantnag": ["Anantnag"],
        "Bandipora": ["Bandipora"],
        "Baramulla": ["Baramulla"],
        "Budgam": ["Budgam"],
        "Doda": ["Doda"],
        "Ganderbal": ["Ganderbal"],
        "Jammu": ["Jammu"],
        "Kathua": ["Kathua"],
        "Kishtwar": ["Kishtwar"],
        "Kulgam": ["Kulgam"],
        "Kupwara": ["Kupwara"],
        "Poonch": ["Poonch"],
        "Pulwama": ["Pulwama"],
        "Rajouri": ["Rajouri"],
        "Ramban": ["Ramban"],
        "Reasi": ["Reasi"],
        "Samba": ["Samba"],
        "Shopian": ["Shopian"],
        "Srinagar": ["Srinagar"],
        "Udhampur": ["Udhampur"]
    },

    "Ladakh": {
        "Kargil": ["Kargil"],
        "Leh": ["Leh"]
    },

    "Lakshadweep": {
        "Lakshadweep": ["Kavaratti", "Agatti"]
    },

    "Puducherry": {
        "Karaikal": ["Karaikal"],
        "Mahe": ["Mahe"],
        "Puducherry": ["Puducherry"],
        "Yanam": ["Yanam"]
    }

};

const AdvCenters: React.FC = () => {
    const [state, setState] = useState<string>("");
    const [district, setDistrict] = useState<string>("");

    const districts = state && data[state] ? Object.keys(data[state]) : [];
    const cities =
        state && district && data[state]?.[district]
            ? data[state][district]
            : [];

    return (
        <div className={styles.pageContainer}>
            <header className={styles.centerHeader}>
                <h1 className={styles.title}>E-Advocate Centers</h1>
                <h3 className={styles.subtitle}>All Over India</h3>
            </header>

            {/* ================= TOP GRID ================= */}
            <section className={styles.topGrid}>
                <div className={styles.card}>
                    <img
                        src="https://raw.githubusercontent.com/BOINISRIHARI/Allstates/refs/heads/main/india_map.jpg"
                        alt="India Map"
                        className={styles.mapImage}
                    />
                </div>

                <div className={styles.card}>
                    <label className={styles.label}>Select State</label>
                    <select
                        className={styles.select}
                        value={state}
                        onChange={(e) => {
                            setState(e.target.value);
                            setDistrict("");
                        }}
                    >
                        <option value="">Select State</option>
                        {Object.keys(stateImages).map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>

                    {stateImages[state] && (
                        <img
                            src={stateImages[state]}
                            alt={state}
                            className={styles.statePreview}
                        />
                    )}
                </div>
            </section>

            {/* ================= BOTTOM GRID ================= */}
            <section className={styles.bottomGrid}>
                <div className={styles.card}>
                    <h3>Districts</h3>
                    <select
                        className={styles.select}
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                    >
                        <option value="">All Districts</option>
                        {districts.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>

                    <div className={styles.gridList}>
                        {districts.map((d) => (
                            <div key={d} className={styles.gridItem}>
                                {d}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.card}>
                    <h3>Cities</h3>
                    <div className={styles.gridList}>
                        {cities.map((c) => (
                            <div key={c} className={styles.gridItem}>
                                {c}
                            </div>
                        ))}
                    </div>
                </div>



            </section>
            <div className={styles.cardfull}>
                <h3>Pin Pointer Location</h3>
                <div className={styles.gridList}>
                    {cities.map((c) => (
                        <div key={c} className={styles.gridItem}>
                            {c}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdvCenters;
