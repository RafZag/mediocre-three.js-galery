let galeryData = [];

async function getData() {
    let response = await fetch(`data.json`);
    let data = await response.json()
    return data;
}

getData()
    .then(data => {

        Object.keys(data).forEach(function (index, item) {
            galeryData[index] = data[index];
        })
        //console.log(galeryData[0].files);
        //console.log("data read: " + Object.keys(galeryData).length);
        //covidDataRead = true;
        //console.log(Object.keys(galeryData).length);       

        for (let i = 0; i < Object.keys(galeryData).length; i++) {
            let str = galeryData[i].files[0];
            if (str.substring(0, 3) == "img") newPlane(i, false, galeryData[i].files[0], galeryData[i].handle, galeryData[i].name);
            else newPlane(i, true, galeryData[i].files[0], galeryData[i].handle, galeryData[i].name)

        }
    });