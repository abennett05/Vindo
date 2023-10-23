import { OpenAI } from '/node_modules/openai';
import { PDFExtract } from '/node_mules/pdf.js-extract'

var openai = new OpenAI({
    apiKey: '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',
});

//let userVin = '';
var str = '';
var pdfExtract = new PDFExtract();
var options = {};

function processInput(){
    let vin = document.getElementById('vinput').value;
    console.log(vin);
    return document.getElementById('vinput').value;
}

const getResponse = async () => {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user',
                content: 'State the Name of the Vehicle, Engine, Transmission, and Drivetrain (whether it is RWD, FWD, or AWD) and then return a categorized list with categories (1. Safety Features, 2. Interior Features, 3. Exterior Features, 4. Performance Features, 5. Connectivity and Entertainment Features, and 6. Optional Features) for this Vehicle Build Sheet: '+str,
            },
        ],
    });
    console.log(response.choices[0].message["content"]);
};

function fetchInfo(){
    let vin = processInput();
    console.log("Gathering info for "+vin);
    pdfExtract.extract('database/'+vin+'.pdf', options, (err, data) => {
        if (err) console.log(err);
        for (const page of data["pages"]){
            for (const val of page["content"]){
                if (val["str"] != "*"){
                    str += val["str"]+' ';
                }
                //console.log(str);
            }
        }
        //getResponse();
    })
}
