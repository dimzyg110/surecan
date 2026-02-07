// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// Home Page - Surecan Clinic
// Handles hero interactions, service toggles, booking flow, and contact form

import { submitContactForm as backendSubmitContactForm } from 'backend/new-module.web';

$w.onReady(function () {
    console.log("Surecan Home page loaded");

    // Initialize page elements
    initializeHeroSection();
    initializeServicesSection();
    initializeBookingFlow();
    initializeContactForm();
    initializeSmoothScrolling();
});

/**
 * Hero Section - Button hover effects and CTA
 */
function initializeHeroSection() {
    // Hero button hover effects
    if ($w("#heroButton")) {
        $w("#heroButton").onMouseIn(() => {
            $w("#heroButton").style.backgroundColor = "#5cb85c"; // Darker green on hover
        });

        $w("#heroButton").onMouseOut(() => {
            $w("#heroButton").style.backgroundColor = "#7ED321"; // Original green
        });

        // Hero button click - scroll to contact section
        $w("#heroButton").onClick(() => {
            $w("#contact").scrollTo();
        });
    }
}

/**
 * Services Section - Expandable service details
 */
function initializeServicesSection() {
    // Service 1 - Initial Consultation
    if ($w("#service1Button")) {
        $w("#service1Button").onClick(() => {
            if ($w("#service1Details")) {
                $w("#service1Details").toggle();
            }
        });
    }

    // Service 2 - Follow-Up Care
    if ($w("#service2Button")) {
        $w("#service2Button").onClick(() => {
            if ($w("#service2Details")) {
                $w("#service2Details").toggle();
            }
        });
    }

    // Service 3 - Specialized Services
    if ($w("#service3Button")) {
        $w("#service3Button").onClick(() => {
            if ($w("#service3Details")) {
                $w("#service3Details").toggle();
            }
        });
    }

    // All "Book Consult Now" buttons in services scroll to contact
    const serviceBookButtons = ["#serviceBook1", "#serviceBook2", "#serviceBook3"];
    serviceBookButtons.forEach(buttonId => {
        if ($w(buttonId)) {
            $w(buttonId).onClick(() => {
                $w("#contact").scrollTo();
            });
        }
    });
}

/**
 * Booking Flow - Multi-step booking process
 */
function initializeBookingFlow() {
    // Book Now button - start booking flow
    if ($w("#bookNowButton")) {
        $w("#bookNowButton").onClick(() => {
            if ($w("#bookingStep1") && $w("#bookingStep2")) {
                $w("#bookingStep1").show();
                $w("#bookingStep2").hide();
                // Scroll to booking section
                $w("#bookingStep1").scrollTo();
            }
        });
    }

    // Next step button - proceed to step 2
    if ($w("#nextStepButton")) {
        $w("#nextStepButton").onClick(() => {
            // Validate step 1 before proceeding
            if (validateBookingStep1()) {
                if ($w("#bookingStep1") && $w("#bookingStep2")) {
                    $w("#bookingStep1").hide();
                    $w("#bookingStep2").show();
                    $w("#bookingStep2").scrollTo();
                }
            }
        });
    }

    // Back button - return to step 1
    if ($w("#backStepButton")) {
        $w("#backStepButton").onClick(() => {
            if ($w("#bookingStep1") && $w("#bookingStep2")) {
                $w("#bookingStep2").hide();
                $w("#bookingStep1").show();
                $w("#bookingStep1").scrollTo();
            }
        });
    }
}

/**
 * Validate booking step 1 fields
 */
function validateBookingStep1() {
    let isValid = true;
    
    // Check if service is selected
    if ($w("#serviceDropdown") && !$w("#serviceDropdown").value) {
        $w("#serviceDropdown").style.borderColor = "#ff0000";
        isValid = false;
    }

    // Check if date is selected
    if ($w("#dateInput") && !$w("#dateInput").value) {
        $w("#dateInput").style.borderColor = "#ff0000";
        isValid = false;
    }

    if (!isValid) {
        if ($w("#validationMessage")) {
            $w("#validationMessage").text = "Please fill in all required fields";
            $w("#validationMessage").show();
        }
    }

    return isValid;
}

/**
 * Contact Form - Form submission handling
 */
function initializeContactForm() {
    if ($w("#contactForm")) {
        $w("#contactForm").onSubmit((event) => {
            // Get form values
            const name = $w("#nameInput") ? $w("#nameInput").value : "";
            const email = $w("#emailInput") ? $w("#emailInput").value : "";
            const phone = $w("#phoneInput") ? $w("#phoneInput").value : "";
            const message = $w("#messageInput") ? $w("#messageInput").value : "";

            // Validate form
            if (!name || !email || !phone) {
                if ($w("#formErrorMessage")) {
                    $w("#formErrorMessage").text = "Please fill in all required fields";
                    $w("#formErrorMessage").show();
                }
                return;
            }

            // Validate email format
            if (!isValidEmail(email)) {
                if ($w("#formErrorMessage")) {
                    $w("#formErrorMessage").text = "Please enter a valid email address";
                    $w("#formErrorMessage").show();
                }
                return;
            }

            // Show loading state
            if ($w("#submitButton")) {
                $w("#submitButton").disable();
                $w("#submitButton").label = "Submitting...";
            }

            // Submit form data
            submitContactForm(name, email, phone, message)
                .then(() => {
                    // Show success message
                    if ($w("#formSuccessMessage")) {
                        $w("#formSuccessMessage").show();
                    }
                    // Clear form
                    $w("#contactForm").reset();
                    // Hide form
                    if ($w("#contactForm")) {
                        $w("#contactForm").hide();
                    }
                })
                .catch((error) => {
                    console.error("Form submission error:", error);
                    if ($w("#formErrorMessage")) {
                        $w("#formErrorMessage").text = "An error occurred. Please try again.";
                        $w("#formErrorMessage").show();
                    }
                })
                .finally(() => {
                    // Reset button state
                    if ($w("#submitButton")) {
                        $w("#submitButton").enable();
                        $w("#submitButton").label = "Book Consult Now";
                    }
                });
        });
    }
}

/**
 * Submit contact form data to backend
 */
async function submitContactForm(name, email, phone, message) {
    try {
        // Call backend function to save to database
        const result = await backendSubmitContactForm({
            name: name,
            email: email,
            phone: phone,
            message: message
        });

        if (result.success) {
            console.log("Form submitted successfully:", result);
            return Promise.resolve();
        } else {
            console.error("Form submission failed:", result.error);
            return Promise.reject(new Error(result.error));
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        return Promise.reject(error);
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Smooth Scrolling for Navigation Links
 */
function initializeSmoothScrolling() {
    // Navigation links
    const navLinks = {
        "#navHome": "#home",
        "#navAbout": "#about",
        "#navServices": "#services",
        "#navContact": "#contact"
    };

    Object.keys(navLinks).forEach(linkId => {
        if ($w(linkId)) {
            $w(linkId).onClick(() => {
                const targetSection = navLinks[linkId];
                if ($w(targetSection)) {
                    $w(targetSection).scrollTo();
                }
            });
        }
    });

    // All "Book Now" strip buttons
    if ($w("#bookNowStripButton")) {
        $w("#bookNowStripButton").onClick(() => {
            $w("#contact").scrollTo();
        });
    }
}

// Google Analytics tracking (optional)
// To use: Replace 'YOUR_GA_TRACKING_ID' with your actual tracking ID
// if (typeof gtag !== 'undefined') {
//     gtag('config', 'YOUR_GA_TRACKING_ID', {
//         page_path: '/home'
//     });
// }
