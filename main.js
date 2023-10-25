const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const PDFParser = require('pdf-parse');

const OpenAI = require('openai');
const openai_key = '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';

const openai = new OpenAI.OpenAI({
    apiKey: openai_key,
});


const hostname = '127.0.0.1';
const port = 3000;

app.use(express.text());
app.use(cors());

app.post('/parseData', (req, res) => {
    console.log(`Received ${req.body}`);
    async function execute(){
        let response = await fetchVIN(req.body);
        res.send(response);
    }
    execute();
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

async function fetchVIN(vin){
    const res = await fetch(`https://www.dodge.com/webselfservice/BuildSheetServlet?vin=${vin}`);
    const buffer = await res.arrayBuffer();
    const uInt8Array = new Uint8Array(buffer);
    let VINData = '';

    if (! fs.existsSync(`./database/${vin}.pdf`)){
        fs.writeFileSync(`./database/${vin}.pdf`, uInt8Array);
        console.log('PDF saved');
    }
    else { console.log('PDF already exists');}
    let PDFData = await parsePDF(vin);
    const getResponse = async () => {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `Collect the following data from this build sheet: ${PDFData} and format in the format I provide
                    Name (no prefix like Name: just list the Name of the Vehicle)
                    Engine: engine
                    Transmission: transmission
                    Drivetrain: drivetrain
                    VIN: vin
                    Safety Features
                    -safety features that you find
                    -list each one on a new line
                    Interior Features
                    -interior features that you find
                    -list each one on a new line
                    Exterior Features
                    -exterior features that you find
                    -list each one on a new line
                    Performance Features
                    -performance features that you find
                    -list each one on a new line
                    Connectivity and Entertainment Features
                    -connectivity and entertainment features that you find
                    -list each one on a new line
                    Optional Features
                    -optional features that you find
                    -list each one on a new line`,
                    //content: `State the Name of the Vehicle, Engine, Transmission, and Drivetrain (whether it is RWD, FWD, or AWD) and then return a categorized list with categories (1. Safety Features, 2. Interior Features, 3. Exterior Features, 4. Performance Features, 5. Connectivity and Entertainment Features, and 6. Optional Features) for this Vehicle Build Sheet: ${PDFData}`,
                },
            ],
        });
        console.log(response.choices[0].message["content"]);
        VINData = response.choices[0].message["content"];
    };
    await getResponse();
    return VINData;
}

async function parsePDF(filename) {
    try {
        // Read the PDF file
        const pdfBuffer = fs.readFileSync('./database/'+filename+'.pdf');

        // Parse the PDF document
        const data = await PDFParser(pdfBuffer);

        // Extracted text from PDF
        return data.text;
    } catch (error) {
        throw error;
    }
}