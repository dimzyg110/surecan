// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction

$w.onReady(function () {

    // Write your Javascript code here using the Velo framework API

    // Print hello world:
    // console.log("Hello world!");

    // Call functions on page elements, e.g.:
    // $w("#button1").label = "Click me!";

    // Click "Run", or Preview your site, to execute your code

});
$w.onReady(function () {
            $w("#contactForm").onSubmit((event) => {
                        const name = $w("#nameInput").value;
                        const email = $w("#emailInput").value;
                        const message = $w("#messageInput").

                        $w.onReady(function () {
                                    $w("#heroButton").onMouseIn(() => {
                                        $w("#heroButton").style.backgroundColor = "#5cb85c"; // Darker green
                                    });
                                    $w("#heroButton").onMouseOut(() => {

                                                $w.onReady(function () {
                                                    $w("#service1Button").onClick(() => {
                                                        $w("#service1Details").toggle();
                                                    });
                                                    // Repeat for other services
                                                });

                                                $w.onReady(function () {
                                                    $w("#bookNowButton").onClick(() => {
                                                        $w("#bookingStep1").show();
                                                        $w("#bookingStep2").hide();
                                                    });
                                                    $w("#nextStepButton").onClick(() => {
                                                        $w("#bookingStep2").show();
                                                        $w("#bookingStep1").hide();
                                                    });
                                                });
                                                // Paste your GA tracking code here (from Google Analytics)
                                                // Example: gtag('config', 'GA_TRACKING_ID');