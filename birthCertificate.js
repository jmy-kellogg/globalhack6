var pdfFillForm = require('pdf-fill-form');
var fs = require('fs');
var pdfFillObj = {};
var clientObj;
var xlsx = require('xlsx');

// var db = require('./server/models/index').db;
// var Client = require('./server/models/index').Client;

var workbook = xlsx.readFile('sd.xlsx');

var allClientData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {raw: true});


function getJsDateFromExcel(excelDate) {

// JavaScript dates can be constructed by passing milliseconds
// since the Unix epoch (January 1, 1970) example: new Date(12312512312);

// 1. Subtract number of days between Jan 1, 1900 and Jan 1, 1970, plus 1 (Google "excel leap year bug")
// 2. Convert to milliseconds.

return new Date((excelDate - (25567 + 2))*86400*1000);

}


// console.log(allClientData);
// get Client UUID
// look up data via UUID
// hard code 90077 for now
allClientData.forEach(client => {
  if(client.UUID == 90077){
    clientObj = client;
    // console.log(client);
  }
})
// console.log(clientObj);

// reading data
pdfFillForm.read('birthdeathwithTextFields.pdf')
.then(res => {
  console.log(res);
  res.forEach(field => {
    console.log(field);
    // for each field in the pdf form, look in the database to see if there's relevant info
        if(field.name.toLowerCase() === 'undefined'){
          pdfFillObj[field.name] = true;
        }
        else if(field.name.toLowerCase() === 'number of copies'){
          pdfFillObj[field.name] = 1;
        }
        else if(field.name.toLowerCase() === 'full name on certificate'){
            pdfFillObj[field.name] = clientObj.First_Name + ' ' + clientObj.Middle_Name + ' ' + clientObj.Last_Name;
        }
        else if(field.name.toLowerCase() === 'date of birth'){
            var clientDOB = new Date(getJsDateFromExcel(clientObj.DOB)).toISOString()
            pdfFillObj[field.name] = clientDOB.slice(5, 7) + '/' + clientDOB.slice(8, 10) +  '/' + clientDOB.slice(0, 4);
        }
        else if(field.name.toLowerCase() === 'place of birth county state'){
          if(clientObj.Birth_City && clientObj.Birth_State){
            pdfFillObj[field.name] = clientObj.Birth_City + ', ' +  clientObj.Birth_State
          }
        }
        else if(field.name.toLowerCase() === 'sex'){
            if(clientObj.Gender === 0 && field.id === 65545){
                pdfFillObj[field.name] = true;
            }else if(clientObj.Gender === 1 && field.id === 65546){
                pdfFillObj[field.name] = true;
            }
        }
        else if(field.name.toLowerCase() === 'applicants name'){
            pdfFillObj[field.name] = clientObj.First_Name + ' ' + clientObj.Middle_Name + ' ' + clientObj.Last_Name;
        }
        //Using the St. Patrick address for now update/change as necessary Yi Chao
        else if(field.name.toLowerCase() === 'applicants street address'){
            pdfFillObj[field.name] = '800 N. Tucker Blvd.'
        }
        else if(field.name.toLowerCase() === 'applicants citytown'){
            pdfFillObj[field.name] = 'St. Louis'
        }
        else if(field.name.toLowerCase() === 'state'){
            pdfFillObj[field.name] = 'MO'
        }
        else if(field.name.toLowerCase() === 'zip'){
            pdfFillObj[field.name] = '63101'
        }
        else if(field.name.toLowerCase() === 'purpose for certificate request'){
            pdfFillObj[field.name] = 'Job-hunting'
        }
        else if(field.name.toLowerCase() === 'date'){
            var currentDate = new Date(new Date.getTIme() + 24* 60*60*1000);
            pdfFillObj[field.name] = currentDate.getMonth() + 1 + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();
        }

  })
  pdfFillForm.write('birthdeathwithTextFields.pdf',
  pdfFillObj,
  {
    "save": "pdf"
  } )
  .then(function(result) {
    console.log('heres pdfFillObj', pdfFillObj);

    fs.writeFile("test123.pdf", result, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
  }, function(err) {
      console.log(err);
  });

})


// writing data


// console.log(data);
// data.forEach(field => {
//   console.log(field);
// })