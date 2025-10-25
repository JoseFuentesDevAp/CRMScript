
async function createLogAccountOnSave(executionContext) {

    const formContext = executionContext.getFormContext();
    const entityname = formContext.data.entity.getEntityName();

    if (entityname !== "account") {
        return;
    }

    const CRMAPI = await setmode();
    
    const logDate = {
        "ap_descripcion": "Registro Modificado " + formContext.data.entity.getId(),
    }

    CRMAPI.createRecord("ap_logclientes", logDate).then(
        function success(result) {
            console.log("Log created with ID: " + result.id);
        },
        function (error) {
            console.error("Error creating log: " + error.message);
            showMessage("Error creating log: " + error.message, "Error");
        }
    );

}


async function initForm(executionContext)
{
    const formContext = executionContext.getFormContext();
    const attributes = formContext.data.entity.attributes.get();

    formContext.getAttribute("defaultuomscheduleid").setRequiredLevel('none');
    formContext.getAttribute("defaultuomid").setRequiredLevel('none');
    formContext.getAttribute("quantitydecimal").setRequiredLevel('none');

    const CRMAPI = await setmode();
    const options =  `?$select=name,pricelevelid&$filter=name eq 'Lista de Precios'`;

    const response = await CRMAPI.retrieveMultipleRecords("pricelevel", options).then(
        function success(result) {
            if (result.entities.length > 0) {
                const priceLevel = result.entities[0];

                const priceleveldata = [
                    {
                        id : priceLevel.pricelevelid,
                        name: priceLevel.name,
                        entityType: "pricelevel"

                    }
                ]

                formContext.getAttribute("pricelevelid").setValue(priceleveldata);
            }
        },
        function error(error) {
            console.log("Error retrieving price level:", error.message);
            showMessage("Error retrieving price level: " + error.message, "Error");
        });
    

   
}


async function getCountryCode(executionContext) {

    const formContext = executionContext.getFormContext();
    const entityname = formContext.data.entity.getEntityName();

    const countryCode = formContext.getAttribute('ap_codigopais').getValue();

    if (countryCode == '') {
        return;
    }

   	
    const data = null;


    var requestOptions = {
        method: 'GET',
        headers: {
                "x-api-key": "--registrarse en apiverse para obtener el apikey--",
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
        
        body: null,
        redirect: 'follow'
    };


    const countryUrl =  `https://api.apiverve.com/v1/callingcode?country=${countryCode}`;

    fetch(countryUrl, requestOptions).then(response => {
        if (!response.ok){
            console.log(`${response.status} ${response.statusText}`);
            return;
        }
        return response.text();
    }).then(result => {

        if (!result.status == 'ok') {
            console.log(result.error);
            return;
        }
        const resultJ = JSON.parse(result);
        const phonecode = resultJ.data.callingcodes[0];
        Xrm.Page.getAttribute('telephone1').setValue(phonecode);
    }).catch(error => console.log(error));
        
							



}



