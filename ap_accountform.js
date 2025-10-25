async function onShippingMethodChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var shippingMethodCodeAttribute = formContext.getAttribute("address1_shippingmethodcode");
    
    if (!shippingMethodCodeAttribute) {
        console.log("Campo shippingmethodcode no encontrado");
        return;
    }
    
    var newShippingMethodValue = shippingMethodCodeAttribute.getValue();
    
    if (!newShippingMethodValue) {
        console.log("No hay valor para shippingmethodcode");
        return;
    }
    
    var accountId = formContext.data.entity.getId().replace(/[{}]/g, "");
    
    // Usar FetchXML
    await updateRelatedSalesOrders(accountId, newShippingMethodValue);
    
    // Alternativa usando OData
    // await updateRelatedSalesOrdersGet(accountId, newShippingMethodValue);
}

async function updateRelatedSalesOrders(accountId, shippingMethodValue) {
    try {
        var fetchXml = [
            "<fetch>",
            "  <entity name='salesorder'>",
            "    <attribute name='salesorderid' />",
            "    <filter>",
            "      <condition attribute='customerid' operator='eq' value='" + accountId + "' />",
            "    </filter>",
            "  </entity>",
            "</fetch>"
        ].join("");
        
        var CRMAPI = await setmode();
        var result = await CRMAPI.retrieveMultipleRecords("salesorder", "?fetchXml=" + encodeURIComponent(fetchXml));
        
        if (result.entities.length === 0) {
            console.log("No se encontraron pedidos de venta relacionados");
            showMessage("No se encontraron pedidos de venta para actualizar", "Información");
            return;
        }
        
        for (var i = 0; i < result.entities.length; i++) {
            var salesOrderId = result.entities[i].salesorderid;
            var updateData = {
                shippingmethodcode: shippingMethodValue
            };
            
            await CRMAPI.updateRecord("salesorder", salesOrderId, updateData);
        }
        
        showMessage("Se actualizaron " + result.entities.length + " pedidos de venta correctamente", "Actualización exitosa");
        
    } catch (error) {
        console.error("Error al actualizar pedidos de venta:", error.message);
        showMessage("Error al actualizar los pedidos de venta: " + error.message, "Error");
    }
}

async function initForm(executionContext) {
    try {
        // Obtener el contexto del formulario
        const formContext = executionContext.getFormContext();
        
        // Obtener los atributos de latitud y longitud
        const latitudeAttr = formContext.getAttribute("address1_latitude");
        const longitudeAttr = formContext.getAttribute("address1_longitude");
        
        // Verificar que los atributos existen
        if (!latitudeAttr || !longitudeAttr) {
            console.log("Los atributos de ubicación no están disponibles en el formulario");
            return;
        }
        
        // Obtener los valores
        const latitude = latitudeAttr.getValue();
        const longitude = longitudeAttr.getValue();
        
        // Verificar que los valores no sean nulos o vacíos
        if (latitude === null || longitude === null || 
            latitude === undefined || longitude === undefined) {
            console.log("No hay datos de ubicación disponibles");
            return;
        }
        
        // Construir la URL de la API
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m`;
        
        // Hacer la llamada a la API
        const response = await fetch(apiUrl);
        
        // Verificar que la respuesta sea exitosa
        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }
        
        // Parsear la respuesta JSON
        const data = await response.json();
        
        // Extraer los datos necesarios
        const temperature = data.current_weather.temperature;
        const windspeed = data.current_weather.windspeed;
        const temperatureUnit = data.current_weather_units.temperature;
        const windspeedUnit = data.current_weather_units.windspeed;
        
        // Construir el mensaje
        const message = `La temperatura en la ubicación es ${temperature} ${temperatureUnit} y la velocidad del viento es ${windspeed} ${windspeedUnit}`;
        
        // Mostrar el mensaje
        showMessage(message);
        
    } catch (error) {
        console.error("Error al obtener datos meteorológicos:", error);
        showMessage("No se pudieron obtener los datos meteorológicos");
    }
}

async function updateRelatedSalesOrdersGet(accountId, shippingMethodValue) {
    try {
        var options = "?$select=salesorderid&$filter=_customerid_value eq " + accountId;
        
        var CRMAPI = await setmode();
        var result = await CRMAPI.retrieveMultipleRecords("salesorder", options);
        
        if (result.entities.length === 0) {
            console.log("No se encontraron pedidos de venta relacionados");
            showMessage("No se encontraron pedidos de venta para actualizar", "Información");
            return;
        }
        
        for (var i = 0; i < result.entities.length; i++) {
            var salesOrderId = result.entities[i].salesorderid;
            var updateData = {
                shippingmethodcode: shippingMethodValue
            };
            
            await CRMAPI.updateRecord("salesorder", salesOrderId, updateData);
        }
        
        showMessage("Se actualizaron " + result.entities.length + " pedidos de venta correctamente", "Actualización exitosa");
        
    } catch (error) {
        console.error("Error al actualizar pedidos de venta:", error.message);
        showMessage("Error al actualizar los pedidos de venta: " + error.message, "Error");
    }
}

