async function offmode(entity_name) {
    return Xrm.WebApi.offline.isAvailableOffline(entity_name);
}

async function setmode() {

    const clientContext = Xrm.Utility.getGlobalContext().client;
    if (clientContext.getClientState() === "Offline") {

        CRMAPI = Xrm.WebApi.offline;

    } else {
     
        CRMAPI = Xrm.WebApi.online;
    }


    return CRMAPI;

}

function showMessage(message, Title) {

    var alertStrings = { confirmButtonLabel: "OK", text: message, title: Title};
    var alertOptions = { height: 180, width: 260 };
    Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);

}