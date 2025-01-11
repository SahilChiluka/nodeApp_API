const { faker } = require('@faker-js/faker');
 

let bulkData = []; 
async function bulkinsert(){
    for (let i = 0; i < 100000; i++) {
        
        var agentName=faker.helpers.arrayElement(['pradeep', 'atul', 'sahil', 'rohit', 'akash', 'anupam', 'ajay', 'ayush'])
        var campaignName=faker.helpers.arrayElement(['Insurance', 'sales', 'marketing', 'finance'])
        var processName= faker.helpers.arrayElement(['process1', 'process2', 'process3', 'process4', 'process5'])
        var leadID= Math.floor(Math.random() * 10)+1;
        var referenceUUID= faker.string.uuid();
        var customerUUID= faker.string.uuid();

        const randomHour = 12 + Math.floor(Math.random() * 12);
        const randomMinute = Math.floor(Math.random() * 60);
        const randomSecond = Math.floor(Math.random() * 60);

        var datetime = new Date();
        datetime.setHours(randomHour, randomMinute, randomSecond);

        let calltype = faker.helpers.arrayElement(['disposed', 'missed', 'autoFail', 'autoDrop']);
        // console.log(calltype)
        let disposeName;
        let disposeType = 'null';
            
        if (calltype == 'missed') {
          disposeName = 'agent not found';
          agentName = 'null';
          referenceUUID = 'null';
        } else if (calltype == "autoFail") {
          disposeName = faker.helpers.arrayElement(["busy", "decline", "not reachable"]);
          customerUUID = 'null';
        } else if(calltype == "autoDrop") {
            disposeName = 'agent not found';
            agentName = 'null';
            referenceUUID = 'null';
        } else {
            disposeName = faker.helpers.arrayElement(['follow up', 'do not call', 'external transfer']);
            if (disposeName == 'follow up') {
                disposeType = 'callback';
            } else if (disposeName == 'do not call') {
                disposeType = 'dnc';
            } else {
                disposeType = 'etx';
            }
        }
        
        let ringing = 0;
        let transfer = 0;
        let callTime = 0;
        let mute = 0;
        let conference = 0;
        let hold = 0;
        let disposetime = 0;
        let duration = 0;
        
        if (calltype == 'missed' || calltype == 'autoFail' || calltype == 'autoDrop' ) {
            if(disposeName == 'not reachable') {
                ringing = 0;
            }
          ringing = faker.number.int({ min: 5, max: 20 });
        } else {
            ringing = faker.number.int({ min: 5, max: 20 });
            const buttons = faker.helpers.arrayElement(['mute', 'conference', 'hold', '']);
          // selectedVariables.forEach(variable => {
            // console.log(buttons);
            disposetime = 10 + Math.floor(Math.random() * 10)+1;
            callTime = faker.number.int({ min: 10, max: 300 });
            if(disposeType == 'etx') {
                transfer = faker.number.int({ min: 5, max: 300 });
            } else {
                switch (buttons) {
                case 'mute':
                    mute = faker.number.int({ min: 5, max: 60 });
                    break;
                case 'conference':
                    conference = faker.number.int({ min: 20, max: 300 });
                    break;
                case 'hold':
                    hold = faker.number.int({ min: 5, max: 60 });
                    break;
                }
            }
        // });
      duration = ringing+transfer+callTime+mute+conference+hold;
    }
    bulkData.push({ 
        calltype,
        agentName, 
        campaignName, 
        processName, 
        leadID, 
        referenceUUID, 
        customerUUID, 
        ringing,
        callTime, 
        hold, 
        mute, 
        transfer, 
        conference, 
        duration, 
        disposeType, 
        disposeName,  
        disposetime,
        datetime
    });
}

}
bulkinsert();
// console.log(bulkData);
module.exports = bulkData;

// const time = new Date();// faker.date.soon({ days: 1 }) // '2022-02-05T09:55:39.216Z'
// console.log(time);
// Generate a random number between 0 and 23 for the hour
// const randomHour = 12 + Math.floor(Math.random() * 12); 

// // Generate a random number between 0 and 59 for the minute
// const randomMinute = Math.floor(Math.random() * 60); 

// // Generate a random number between 0 and 59 for the second
// const randomSecond = Math.floor(Math.random() * 60);

// // Create a new Date object and set the time
// const randomTime = new Date();
// randomTime.setHours(randomHour, randomMinute, randomSecond);

// console.log(randomTime.toLocaleTimeString());