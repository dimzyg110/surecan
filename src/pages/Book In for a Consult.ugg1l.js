// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// Book In for a Consult Page - Surecan Clinic
// Handles consultation booking form with validation and submission

import { submitConsultationBooking, getAvailableTimeSlots } from 'backend/new-module.web';

$w.onReady(function () {
    console.log("Book In for a Consult page loaded");

    // Initialize booking form
    initializeBookingForm();
    initializeServiceSelection();
    initializeDateTimePicker();
});

/**
 * Initialize the main booking form
 */
function initializeBookingForm() {
    if ($w("#bookingForm")) {
        $w("#bookingForm").onSubmit((event) => {
            event.preventDefault();

            // Get form values
            const formData = {
                name: $w("#nameInput") ? $w("#nameInput").value : "",
                email: $w("#emailInput") ? $w("#emailInput").value : "",
                phone: $w("#phoneInput") ? $w("#phoneInput").value : "",
                service: $w("#serviceDropdown") ? $w("#serviceDropdown").value : "",
                preferredDate: $w("#dateInput") ? $w("#dateInput").value : null,
                preferredTime: $w("#timeDropdown") ? $w("#timeDropdown").value : "",
                message: $w("#messageInput") ? $w("#messageInput").value : "",
                newPatient: $w("#newPatientCheckbox") ? $w("#newPatientCheckbox").checked : false
            };

            // Validate form data
            if (!validateBookingForm(formData)) {
                return;
            }

            // Show loading state
            showLoadingState(true);

            // Submit booking
            submitBooking(formData)
                .then(() => {
                    showSuccessMessage();
                    resetForm();
                })
                .catch((error) => {
                    console.error("Booking submission error:", error);
                    showErrorMessage("Unable to submit booking. Please try again or contact us directly.");
                })
                .finally(() => {
                    showLoadingState(false);
                });
        });
    }
}

/**
 * Initialize service selection dropdown
 */
function initializeServiceSelection() {
    if ($w("#serviceDropdown")) {
        const services = [
            { label: "Select a service...", value: "" },
            { label: "Initial Consultation (30 min) - $150", value: "initial" },
            { label: "Follow-Up Consultation (20 min) - $100", value: "followup" },
            { label: "Comprehensive Health Assessment (60 min) - $250", value: "comprehensive" },
            { label: "Specialized Consultation - Contact for pricing", value: "specialized" }
        ];

        $w("#serviceDropdown").options = services;

        // Update description based on service selection
        $w("#serviceDropdown").onChange(() => {
            updateServiceDescription($w("#serviceDropdown").value);
        });
    }
}

/**
 * Update service description text
 */
function updateServiceDescription(serviceType) {
    const descriptions = {
        initial: "A comprehensive initial consultation to assess your health needs and create a personalized care plan.",
        followup: "Review your progress and adjust your treatment plan as needed.",
        comprehensive: "In-depth health assessment including detailed examination and personalized wellness recommendations.",
        specialized: "Specialized services tailored to your specific health requirements. Our team will contact you to discuss details and pricing."
    };

    if ($w("#serviceDescription") && descriptions[serviceType]) {
        $w("#serviceDescription").text = descriptions[serviceType];
        $w("#serviceDescription").show();
    } else if ($w("#serviceDescription")) {
        $w("#serviceDescription").hide();
    }
}

/**
 * Initialize date and time pickers
 */
function initializeDateTimePicker() {
    // Set minimum date to today
    if ($w("#dateInput")) {
        const today = new Date();
        $w("#dateInput").minDate = today;

        // Set maximum date to 90 days from now
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 90);
        $w("#dateInput").maxDate = maxDate;

        // Disable weekends
        $w("#dateInput").disabledDates = getWeekendDates();
    }

    // Populate time slots
    if ($w("#timeDropdown")) {
        const timeSlots = [
            { label: "Select preferred time...", value: "" },
            { label: "9:00 AM", value: "09:00" },
            { label: "10:00 AM", value: "10:00" },
            { label: "11:00 AM", value: "11:00" },
            { label: "12:00 PM", value: "12:00" },
            { label: "1:00 PM", value: "13:00" },
            { label: "2:00 PM", value: "14:00" },
            { label: "3:00 PM", value: "15:00" },
            { label: "4:00 PM", value: "16:00" }
        ];

        $w("#timeDropdown").options = timeSlots;
    }
}

/**
 * Get array of weekend dates for the next 90 days
 */
function getWeekendDates() {
    const weekends = [];
    const today = new Date();

    for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        // 0 = Sunday, 6 = Saturday
        if (date.getDay() === 0 || date.getDay() === 6) {
            weekends.push(date);
        }
    }

    return weekends;
}

/**
 * Validate booking form data
 */
function validateBookingForm(formData) {
    let isValid = true;
    const errors = [];

    // Validate name
    if (!formData.name || formData.name.trim().length < 2) {
        errors.push("Please enter your full name");
        highlightField("#nameInput", true);
        isValid = false;
    } else {
        highlightField("#nameInput", false);
    }

    // Validate email
    if (!formData.email || !isValidEmail(formData.email)) {
        errors.push("Please enter a valid email address");
        highlightField("#emailInput", true);
        isValid = false;
    } else {
        highlightField("#emailInput", false);
    }

    // Validate phone
    if (!formData.phone || formData.phone.trim().length < 10) {
        errors.push("Please enter a valid phone number");
        highlightField("#phoneInput", true);
        isValid = false;
    } else {
        highlightField("#phoneInput", false);
    }

    // Validate service selection
    if (!formData.service) {
        errors.push("Please select a service");
        highlightField("#serviceDropdown", true);
        isValid = false;
    } else {
        highlightField("#serviceDropdown", false);
    }

    // Validate date
    if (!formData.preferredDate) {
        errors.push("Please select a preferred date");
        highlightField("#dateInput", true);
        isValid = false;
    } else {
        highlightField("#dateInput", false);
    }

    // Validate time
    if (!formData.preferredTime) {
        errors.push("Please select a preferred time");
        highlightField("#timeDropdown", true);
        isValid = false;
    } else {
        highlightField("#timeDropdown", false);
    }

    // Show validation errors
    if (!isValid && $w("#validationMessage")) {
        $w("#validationMessage").text = errors.join("\n");
        $w("#validationMessage").show();
    } else if ($w("#validationMessage")) {
        $w("#validationMessage").hide();
    }

    return isValid;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Highlight form field (error state)
 */
function highlightField(fieldId, isError) {
    if ($w(fieldId)) {
        if (isError) {
            $w(fieldId).style.borderColor = "#ff0000";
        } else {
            $w(fieldId).style.borderColor = "#dddddd";
        }
    }
}

/**
 * Submit booking data
 */
async function submitBooking(formData) {
    try {
        // Call backend function to save booking
        const result = await submitConsultationBooking(formData);

        if (result.success) {
            console.log("Booking submitted successfully:", result);
            return Promise.resolve(result);
        } else {
            console.error("Booking submission failed:", result.error);
            return Promise.reject(new Error(result.error));
        }
    } catch (error) {
        console.error("Error submitting booking:", error);
        return Promise.reject(error);
    }
}

/**
 * Show loading state during form submission
 */
function showLoadingState(isLoading) {
    if ($w("#submitButton")) {
        if (isLoading) {
            $w("#submitButton").disable();
            $w("#submitButton").label = "Submitting...";
        } else {
            $w("#submitButton").enable();
            $w("#submitButton").label = "Book Consultation";
        }
    }

    // Show/hide loading spinner
    if ($w("#loadingSpinner")) {
        if (isLoading) {
            $w("#loadingSpinner").show();
        } else {
            $w("#loadingSpinner").hide();
        }
    }
}

/**
 * Show success message after booking
 */
function showSuccessMessage() {
    if ($w("#successMessage")) {
        $w("#successMessage").text = "Thank you! Your consultation booking has been received. We'll contact you shortly to confirm your appointment.";
        $w("#successMessage").show();
    }

    // Hide the form
    if ($w("#bookingForm")) {
        $w("#bookingForm").hide();
    }

    // Hide validation message
    if ($w("#validationMessage")) {
        $w("#validationMessage").hide();
    }

    // Scroll to success message
    if ($w("#successMessage")) {
        $w("#successMessage").scrollTo();
    }
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    if ($w("#validationMessage")) {
        $w("#validationMessage").text = message;
        $w("#validationMessage").show();
        $w("#validationMessage").scrollTo();
    }
}

/**
 * Reset form after successful submission
 */
function resetForm() {
    if ($w("#bookingForm")) {
        $w("#bookingForm").reset();
    }

    // Reset service description
    if ($w("#serviceDescription")) {
        $w("#serviceDescription").hide();
    }
}

// Add "Book Another Consultation" button functionality
if ($w("#bookAnotherButton")) {
    $w("#bookAnotherButton").onClick(() => {
        if ($w("#bookingForm") && $w("#successMessage")) {
            $w("#successMessage").hide();
            $w("#bookingForm").show();
            $w("#bookingForm").scrollTo();
        }
    });
}
