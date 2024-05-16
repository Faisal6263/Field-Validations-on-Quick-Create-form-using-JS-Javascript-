if (typeof JFNA === "undefined") var JFNA = {};
if (typeof JFNA.ContactInformation === "undefined") JFNA.ContactInformation = {};


JFNA.ContactInformation = {

    //On Load
    OnLoad: function(context) {
        try {
            var formContext = context.getFormContext();

        } catch (e) {
            Xrm.Utility.closeProgressIndicator();
            Xrm.Utility.alertDialog("Something went wrong. Please contant the administrator.");
        }
    },

    //On Save
    OnSave: function(context) {
        try {
            var formContext = context.getFormContext();

        } catch (e) {
            Xrm.Utility.closeProgressIndicator();
            Xrm.Utility.alertDialog("Something went wrong. Please contant the administrator.");
        }
    },

    //Phone Number Format On Change
    OnPhoneNumberFormatChange: function(context) {
        try {
            var formContext = context.getFormContext();
            var formType = formContext.ui.getFormType();
            //Check if Create Or Update Operation
            if (formType == 1 || formType == 2) {
                JFNA.ContactInformation.retrievePhoneNumberFormatDetails(context);
            }
        } catch (e) {
            Xrm.Utility.closeProgressIndicator();
            Xrm.Utility.alertDialog("Something went wrong. Please contant the administrator.");
        }
    },

    //Phone Number Change
    OnPhoneNumberChange: function(context) {
        try {
            var formContext = context.getFormContext();
            var formType = formContext.ui.getFormType();
            //Check if Create Or Update Operation
            if (formType == 1 || formType == 2) {
                JFNA.ContactInformation.prependCountryCodeToPhoneNumber(context);
            }
        } catch (e) {
            Xrm.Utility.closeProgressIndicator();
            Xrm.Utility.alertDialog("Something went wrong. Please contant the administrator.");
        }
    },

    // This function retrieves the phone number format details
    retrievePhoneNumberFormatDetails: function(executionContext) {

        // Get the form context
        var formContext = executionContext.getFormContext();

        // Get the value of the 'jfna_phonenumberformatid' field
        var phoneNumberFormat = formContext.getAttribute("jfna_phonenumberformatid").getValue();

        // Check if phoneNumberFormat is not null
        if (phoneNumberFormat != null) {
            // Get the id of the phone number format
            var phoneNumberFormatId = phoneNumberFormat[0].id;

            // Use Web API to retrieve the related entity details
            Xrm.WebApi.retrieveRecord("jfna_phonenumberformat", phoneNumberFormatId, "?$select=jfna_countrycode").then(
                function success(result) {
                    // Set the retrieved values to the 'jfna_phonenumber' field
                    var countrycode = result.jfna_countrycode;

                    // Check if country code contains data
                    if (countrycode != null && countrycode != "") {
                        // Set the value of 'jfna_phonenumber' field to the country code
                        formContext.getAttribute("jfna_phonenumber").setValue(countrycode);
                    }
                },
                function(error) {
                    // Show an alert dialog with the error message
                    Xrm.Navigation.openAlertDialog({ text: error.message });
                }
            );
        }
    },

    // This function prepends the country code to the phone number
    prependCountryCodeToPhoneNumber: function(executionContext) {
        // Get the form context
        var formContext = executionContext.getFormContext();

        // Get the 'jfna_phonenumber' and 'jfna_phonenumberformatid' fields
        var phoneNumberField = formContext.getAttribute("jfna_phonenumber");
        var phoneNumberFormatField = formContext.getAttribute("jfna_phonenumberformatid");

        // Check if phoneNumberField or phoneNumberFormatField is null
        if (!phoneNumberField || !phoneNumberFormatField) return;

        // Get the values of the fields
        var phoneNumber = phoneNumberField.getValue();
        var phoneNumberFormat = phoneNumberFormatField.getValue();

        // Check if phoneNumber or phoneNumberFormat is null
        if (!phoneNumber || !phoneNumberFormat) return;

        // Get the id of the phone number format
        var phoneNumberFormatId = phoneNumberFormat[0].id;

        // Use Web API to retrieve the related entity details
        Xrm.WebApi.retrieveRecord("jfna_phonenumberformat", phoneNumberFormatId, "?$select=jfna_countrycode,jfna_phoneformat").then(
            function success(result) {
                // Get the country code and phone format
                var countrycode = result.jfna_countrycode;
                var phoneformat = result.jfna_phoneformat;

                // Check if phone format is undefined
                if (!phoneformat) {
                    console.error("Phone format is undefined.");
                    return;
                }

                // Initialize index and get the length of the format
                var index = 0;
                var formatLength = (phoneformat.match(/#/g) || []).length;

                // Remove the country code from the start of the phone number
                if (countrycode && phoneNumber.startsWith(countrycode)) {
                    phoneNumber = phoneNumber.substring(countrycode.length);
                }

                // Remove spaces and dashes from the phone number
                phoneNumber = phoneNumber.replace(/\s/g, '').replace(/-/g, '');

                // Check if the length of the phone number does not match the required format
                if (phoneNumber.length !== formatLength) {
                    Xrm.Navigation.openAlertDialog({ text: "Phone number not correct" });
                    return;
                }

                // Format the phone number
                var formattedPhoneNumber = phoneformat.split('').map(function(char) {
                    return char === '#' ? phoneNumber.charAt(index++) : char;
                }).join('');

                // Prepend the country code to the formatted phone number
                if (countrycode) {
                    formattedPhoneNumber = countrycode + " " + formattedPhoneNumber;
                }

                // Set the value of the 'jfna_phonenumber' field to the formatted phone number
                phoneNumberField.setValue(formattedPhoneNumber);
            },
            function(error) {
                // Show an alert dialog with the error message
                Xrm.Navigation.openAlertDialog({ text: error.message });
            }
        );
    },
};
