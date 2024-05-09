function retrievePhoneNumberFormatDetails(executionContext) {

    debugger;

    var formContext = executionContext.getFormContext(); // get formContext
    var phoneNumberFormat = formContext.getAttribute("jfna_phonenumberformatid").getValue();

    if (phoneNumberFormat != null) {
        var phoneNumberFormatId = phoneNumberFormat[0].id;

        // Use Web API to retrieve the related entity details
        Xrm.WebApi.retrieveRecord("jfna_phonenumberformat", phoneNumberFormatId, "?$select=jfna_countrycode").then(
            function success(result) {
                // Set the retrieved values to the 'jfna_phonenumber' field
                var countrycode = result.jfna_countrycode;

                // Check if country code contains data
                if (countrycode != null && countrycode != "") {
                    formContext.getAttribute("jfna_phonenumber").setValue(countrycode);
                }
            },
            function(error) {
                Xrm.Navigation.openAlertDialog({ text: error.message });
            }
        );
    }
}


function prependCountryCodeToPhoneNumber(executionContext) {
    var formContext = executionContext.getFormContext();
    var phoneNumberField = formContext.getAttribute("jfna_phonenumber");
    var phoneNumberFormatField = formContext.getAttribute("jfna_phonenumberformatid");

    if (!phoneNumberField || !phoneNumberFormatField) return;

    var phoneNumber = phoneNumberField.getValue();
    var phoneNumberFormat = phoneNumberFormatField.getValue();

    if (!phoneNumber || !phoneNumberFormat) return;

    var phoneNumberFormatId = phoneNumberFormat[0].id;

    Xrm.WebApi.retrieveRecord("jfna_phonenumberformat", phoneNumberFormatId, "?$select=jfna_countrycode,jfna_phoneformat").then(
        function success(result) {
            var countrycode = result.jfna_countrycode;
            var phoneformat = result.jfna_phoneformat;

            if (!phoneformat) {
                console.error("Phone format is undefined.");
                return;
            }

            var index = 0;
            var formatLength = (phoneformat.match(/#/g) || []).length;

            if (countrycode && phoneNumber.startsWith(countrycode)) {
                phoneNumber = phoneNumber.substring(countrycode.length);
            }

            phoneNumber = phoneNumber.replace(/\s/g, '').replace(/-/g, '');

            if (phoneNumber.length !== formatLength) {
                Xrm.Navigation.openAlertDialog({ text: "The length of the phone number does not match the required format." });
                return;
            }

            var formattedPhoneNumber = phoneformat.split('').map(function(char) {
                return char === '#' ? phoneNumber.charAt(index++) : char;
            }).join('');

            if (countrycode) {
                formattedPhoneNumber = countrycode + " " + formattedPhoneNumber;
            }

            phoneNumberField.setValue(formattedPhoneNumber);
        },
        function(error) {
            Xrm.Navigation.openAlertDialog({ text: error.message });
        }
    );
}