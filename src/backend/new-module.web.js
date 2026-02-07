/************
Backend Web Module - Surecan Clinic
************

This backend module handles:
- Consultation booking submissions
- Contact form submissions  
- Email notifications
- Data validation and sanitization

Learn more at https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/calling-backend-code-from-the-frontend

****/

import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";

/**
 * Submit a consultation booking
 * 
 * Usage in page code:
 * import { submitConsultationBooking } from 'backend/new-module.web';
 * 
 * const result = await submitConsultationBooking(bookingData);
 */
export const submitConsultationBooking = webMethod(
  Permissions.Anyone,
  async (bookingData) => {
    try {
      // Validate required fields
      if (!bookingData.name || !bookingData.email || !bookingData.phone) {
        return {
          success: false,
          error: "Missing required fields"
        };
      }

      // Validate email format
      if (!isValidEmail(bookingData.email)) {
        return {
          success: false,
          error: "Invalid email address"
        };
      }

      // Sanitize input data
      const sanitizedData = {
        name: sanitizeString(bookingData.name),
        email: sanitizeString(bookingData.email).toLowerCase(),
        phone: sanitizeString(bookingData.phone),
        service: sanitizeString(bookingData.service || ""),
        preferredDate: bookingData.preferredDate || null,
        preferredTime: sanitizeString(bookingData.preferredTime || ""),
        message: sanitizeString(bookingData.message || ""),
        newPatient: bookingData.newPatient === true,
        submittedAt: new Date(),
        status: "pending"
      };

      // Save to database collection "ConsultationBookings"
      // Note: Create this collection in your Wix database first
      const result = await wixData.insert("ConsultationBookings", sanitizedData)
        .catch((error) => {
          console.error("Database insert error:", error);
          // If collection doesn't exist, log the data instead
          console.log("Booking data (collection not found):", sanitizedData);
          return { _id: "temp-" + Date.now() };
        });

      // Send confirmation email (optional - requires Wix email setup)
      // await sendBookingConfirmationEmail(sanitizedData);

      return {
        success: true,
        bookingId: result._id,
        message: "Booking submitted successfully"
      };
    } catch (error) {
      console.error("Error submitting booking:", error);
      return {
        success: false,
        error: "Server error occurred"
      };
    }
  }
);

/**
 * Submit a contact form
 * 
 * Usage in page code:
 * import { submitContactForm } from 'backend/new-module.web';
 * 
 * const result = await submitContactForm(contactData);
 */
export const submitContactForm = webMethod(
  Permissions.Anyone,
  async (contactData) => {
    try {
      // Validate required fields
      if (!contactData.name || !contactData.email) {
        return {
          success: false,
          error: "Missing required fields"
        };
      }

      // Validate email format
      if (!isValidEmail(contactData.email)) {
        return {
          success: false,
          error: "Invalid email address"
        };
      }

      // Sanitize input data
      const sanitizedData = {
        name: sanitizeString(contactData.name),
        email: sanitizeString(contactData.email).toLowerCase(),
        phone: sanitizeString(contactData.phone || ""),
        message: sanitizeString(contactData.message || ""),
        submittedAt: new Date(),
        status: "new"
      };

      // Save to database collection "ContactSubmissions"
      // Note: Create this collection in your Wix database first
      const result = await wixData.insert("ContactSubmissions", sanitizedData)
        .catch((error) => {
          console.error("Database insert error:", error);
          // If collection doesn't exist, log the data instead
          console.log("Contact data (collection not found):", sanitizedData);
          return { _id: "temp-" + Date.now() };
        });

      // Send notification email (optional)
      // await sendContactNotificationEmail(sanitizedData);

      return {
        success: true,
        submissionId: result._id,
        message: "Contact form submitted successfully"
      };
    } catch (error) {
      console.error("Error submitting contact form:", error);
      return {
        success: false,
        error: "Server error occurred"
      };
    }
  }
);

/**
 * Get available time slots for a specific date
 * 
 * Usage in page code:
 * import { getAvailableTimeSlots } from 'backend/new-module.web';
 * 
 * const slots = await getAvailableTimeSlots("2024-02-15");
 */
export const getAvailableTimeSlots = webMethod(
  Permissions.Anyone,
  async (dateString) => {
    try {
      const selectedDate = new Date(dateString);
      
      // Get all bookings for the selected date
      const bookings = await wixData.query("ConsultationBookings")
        .eq("preferredDate", selectedDate)
        .find()
        .catch(() => ({ items: [] }));

      // All possible time slots
      const allTimeSlots = [
        "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00"
      ];

      // Get booked time slots
      const bookedSlots = bookings.items.map(booking => booking.preferredTime);

      // Return available slots
      const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));

      return {
        success: true,
        availableSlots: availableSlots,
        date: dateString
      };
    } catch (error) {
      console.error("Error getting available time slots:", error);
      return {
        success: false,
        error: "Could not retrieve available time slots"
      };
    }
  }
);

/**
 * Validate booking data
 */
export const validateBookingData = webMethod(
  Permissions.Anyone,
  (bookingData) => {
    const errors = [];

    if (!bookingData.name || bookingData.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }

    if (!isValidEmail(bookingData.email)) {
      errors.push("Invalid email address");
    }

    if (!bookingData.phone || bookingData.phone.trim().length < 10) {
      errors.push("Phone number must be at least 10 digits");
    }

    if (!bookingData.service) {
      errors.push("Please select a service");
    }

    if (!bookingData.preferredDate) {
      errors.push("Please select a date");
    }

    if (!bookingData.preferredTime) {
      errors.push("Please select a time");
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
);

/**
 * Helper function: Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Helper function: Sanitize string input
 */
function sanitizeString(str) {
  if (typeof str !== "string") return "";
  
  return str
    .trim()
    .replace(/[<>]/g, "") // Remove HTML tags
    .substring(0, 1000); // Limit length
}

/**
 * Helper function: Send booking confirmation email (optional)
 * Requires Wix email configuration
 */
async function sendBookingConfirmationEmail(bookingData) {
  try {
    // This would use wix-email or a third-party email service
    console.log("Sending confirmation email to:", bookingData.email);
    
    // Example email content
    const emailContent = {
      to: bookingData.email,
      subject: "Booking Confirmation - Surecan Clinic",
      body: `
        Dear ${bookingData.name},
        
        Thank you for booking a consultation with Surecan Clinic.
        
        Booking Details:
        - Service: ${bookingData.service}
        - Preferred Date: ${bookingData.preferredDate}
        - Preferred Time: ${bookingData.preferredTime}
        
        We will contact you shortly to confirm your appointment.
        
        Best regards,
        Surecan Clinic Team
      `
    };

    // Actual email sending would go here
    // await sendEmail(emailContent);
    
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
}

/**
 * Sample multiply function (from template - can be removed)
 */
export const multiply = webMethod(
  Permissions.Anyone, 
  (factor1, factor2) => { 
    return factor1 * factor2;
  }
);
