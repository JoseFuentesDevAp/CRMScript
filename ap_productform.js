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