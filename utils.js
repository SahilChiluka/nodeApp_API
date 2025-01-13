const { faker } = require('@faker-js/faker');

let mongoData = [];
let mysqlData = []; 
let elasticData = [];
async function bulkinsert(){
    for (let i = 0; i < 100000; i++) {
        
        var agentName=faker.helpers.arrayElement(['pradeep', 'atul', 'sahil', 'rohit', 'akash', 'anupam', 'ajay', 'ayush'])
        var campaignName=faker.helpers.arrayElement(['Insurance', 'sales', 'marketing', 'finance'])
        var processName= faker.helpers.arrayElement(['process1', 'process2', 'process3', 'process4', 'process5'])
        var leadsetID= Math.floor(Math.random() * 10)+1;
        var referenceUUID= faker.string.uuid();
        var customerUUID= faker.string.uuid();

        const randomHour = 12 + Math.floor(Math.random() * 12);
        const randomMinute = Math.floor(Math.random() * 60);
        const randomSecond = Math.floor(Math.random() * 60);

        var datetime = new Date();
        datetime.setHours(randomHour, randomMinute, randomSecond);

        let callType = faker.helpers.arrayElement(['disposed', 'missed', 'autoFail', 'autoDrop']);
        // console.log(calltype)
        let disposeName;
        let disposeType = 'null';
            
        if (callType == 'missed') {
          disposeName = 'agent not found';
          agentName = 'null';
          referenceUUID = 'null';
        } else if (callType == "autoFail") {
          disposeName = faker.helpers.arrayElement(["busy", "decline", "not reachable"]);
          customerUUID = 'null';
        } else if(callType == "autoDrop") {
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
        let disposeTime = 0;
        let duration = 0;
        
        if (callType == 'missed' || callType == 'autoFail' || callType == 'autoDrop' ) {
            if(disposeName == 'not reachable') {
                ringing = 0;
            }
          ringing = faker.number.int({ min: 5, max: 20 });
        } else {
            ringing = faker.number.int({ min: 5, max: 20 });
            const buttons = faker.helpers.arrayElement(['mute', 'conference', 'hold', '']);
          // selectedVariables.forEach(variable => {
            // console.log(buttons);
            disposeTime = 10 + Math.floor(Math.random() * 10)+1;
            callTime = faker.number.int({ min: 10, max: 300 });
            if(disposeType == 'etx') {
                transfer = faker.number.int({ min: 5, max: 30 });
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
        mongoData.push({agentName, campaignName, processName, leadsetID, referenceUUID, customerUUID,callType, ringing,callTime, hold, mute, transfer, conference, duration,disposeTime, disposeType, disposeName,  datetime});

        mysqlData.push([
            agentName, 
            campaignName, 
            processName, 
            leadsetID, 
            referenceUUID, 
            customerUUID,
            callType, 
            ringing,
            callTime, 
            hold, 
            mute, 
            transfer, 
            conference, 
            duration,
            disposeTime, 
            disposeType, 
            disposeName,  
            datetime
        ]);

        elasticData.push({
            index: {
                _index: 'sahil_logger',
            }
        },
        {
            agentName, 
            campaignName, 
            processName, 
            leadsetID, 
            referenceUUID, 
            customerUUID,
            callType, 
            ringing,
            callTime, 
            hold, 
            mute, 
            transfer, 
            conference, 
            duration,
            disposeTime, 
            disposeType, 
            disposeName,  
            datetime
        });
    }

}
bulkinsert();
// console.log(mongoData);
// console.log(elasticData);
module.exports = {mongoData, mysqlData, elasticData};
