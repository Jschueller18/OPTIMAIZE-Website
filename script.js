// Show/hide "Other" text fields when corresponding checkboxes/radio buttons are clicked
document.addEventListener('DOMContentLoaded', function() {
    // Progress Bar and Multi-step Form Logic
    const sections = document.querySelectorAll('.form-section');
    const progressLabels = document.querySelectorAll('.progress-label');
    const progressBar = document.getElementById('form-progress');
    let currentSection = 0;

    // Add navigation buttons to each section except the last one
    sections.forEach((section, index) => {
      // Add active class to first section
      if (index === 0) {
        section.classList.add('active-section');
      }
      
      // Create navigation buttons
      const navDiv = document.createElement('div');
      navDiv.className = 'form-navigation';
      
      if (index > 0) {
        const prevButton = document.createElement('button');
        prevButton.type = 'button';
        prevButton.className = 'nav-button prev-button';
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => goToSection(index - 1));
        navDiv.appendChild(prevButton);
      } else {
        // Create empty div for spacing when there's no prev button
        const spacer = document.createElement('div');
        navDiv.appendChild(spacer);
      }
      
      if (index < sections.length - 1) {
        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className = 'nav-button next-button';
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
          // Validate current section before moving forward
          if (validateSection(index)) {
            goToSection(index + 1);
          }
        });
        navDiv.appendChild(nextButton);
      } else {
        // Move submit button to navigation area for last section
        const submitContainer = document.createElement('div');
        submitContainer.className = 'submit-container';
        
        // Create a new submit button
        const submitButton = document.querySelector('button[type="submit"]').cloneNode(true);
        
        // Hide the original submit button
        document.querySelector('button[type="submit"]').style.display = 'none';
        
        submitContainer.appendChild(submitButton);
        section.appendChild(submitContainer);
      }
      
      section.appendChild(navDiv);
    });

    // Add click events to progress labels
    progressLabels.forEach((label, index) => {
      label.addEventListener('click', () => {
        // Only allow clicking if all previous sections are validated
        let canProceed = true;
        for (let i = 0; i < index; i++) {
          if (!validateSection(i)) {
            canProceed = false;
            break;
          }
        }
        
        if (canProceed) {
          goToSection(index);
        }
      });
    });

    // Function to validate a section
    function validateSection(sectionIndex) {
      const section = sections[sectionIndex];
      const requiredFields = section.querySelectorAll('input[required], select[required], textarea[required]');
      const checkboxGroups = section.querySelectorAll('input[type="checkbox"][required]');
      
      // Check regular required fields
      let isValid = true;
      requiredFields.forEach(field => {
        if (!field.value) {
          isValid = false;
          field.classList.add('invalid');
          
          // Add error message if it doesn't exist
          let errorMsg = field.nextElementSibling;
          if (!errorMsg || !errorMsg.classList.contains('error-message')) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'This field is required';
            field.parentNode.insertBefore(errorMsg, field.nextSibling);
          }
        } else {
          field.classList.remove('invalid');
          const errorMsg = field.nextElementSibling;
          if (errorMsg && errorMsg.classList.contains('error-message')) {
            errorMsg.remove();
          }
        }
      });
      
      // Handle checkbox groups (we only need one checkbox checked for the group to be valid)
      checkboxGroups.forEach(checkbox => {
        const name = checkbox.getAttribute('name');
        const groupChecked = section.querySelector(`input[name="${name}"]:checked`);
        
        if (!groupChecked) {
          isValid = false;
          // Find the checkbox group container
          const container = checkbox.closest('.checkbox-group');
          container.classList.add('invalid');
          
          // Add error message if it doesn't exist
          let errorMsg = container.nextElementSibling;
          if (!errorMsg || !errorMsg.classList.contains('error-message')) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Please select at least one option';
            container.parentNode.insertBefore(errorMsg, container.nextSibling);
          }
        } else {
          const container = checkbox.closest('.checkbox-group');
          container.classList.remove('invalid');
          const errorMsg = container.nextElementSibling;
          if (errorMsg && errorMsg.classList.contains('error-message')) {
            errorMsg.remove();
          }
        }
      });
      
      return isValid;
    }

    // Function to go to a specific section
    function goToSection(index) {
      // Update active section
      sections.forEach(section => section.classList.remove('active-section'));
      sections[index].classList.add('active-section');
      
      // Update progress bar
      const progress = ((index + 1) / sections.length) * 100;
      progressBar.style.width = `${progress}%`;
      
      // Update active label
      progressLabels.forEach(label => label.classList.remove('active'));
      progressLabels[index].classList.add('active');
      
      // Update current section index
      currentSection = index;
      
      // Scroll to top of form
      document.getElementById('survey').scrollIntoView({ behavior: 'smooth' });
    }

    // Add error message styles to the CSS
    document.head.insertAdjacentHTML('beforeend', `
      <style>
        .invalid {
          border-color: #dc3545 !important;
        }
        
        .error-message {
          color: #dc3545;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }
        
        .checkbox-group.invalid {
          padding: 5px;
          border-radius: 4px;
          background-color: rgba(220, 53, 69, 0.05);
        }
      </style>
    `);
    
    // Handle "Other" options toggling
    const otherOptions = [
        {checkbox: 'usage-other', container: 'usage-other-container'},
        {checkbox: 'condition-other', container: 'condition-other-container'},
        {checkbox: 'flavor-other', container: 'flavor-other-container'}
    ];
    
    otherOptions.forEach(option => {
        const checkbox = document.getElementById(option.checkbox);
        const container = document.getElementById(option.container);
        
        if (checkbox && container) {
            checkbox.addEventListener('change', function() {
                container.style.display = this.checked ? 'block' : 'none';
                if (!this.checked) {
                    const textField = container.querySelector('input[type="text"]');
                    if (textField) textField.value = '';
                }
            });
        }
    });
    
    // Handle sweetener type visibility based on sweetener amount
    const sweetenerAmount = document.getElementById('sweetener-amount');
    const sweetenerTypeContainer = document.getElementById('sweetener-type-container');
    
    if (sweetenerAmount && sweetenerTypeContainer) {
        sweetenerAmount.addEventListener('change', function() {
            sweetenerTypeContainer.style.display = 
                (this.value === 'none') ? 'none' : 'block';
            
            if (this.value === 'none') {
                document.getElementById('sweetener-type').value = '';
            }
        });
    }
    
    // Handle condition checkboxes - if "None" is selected, uncheck others
    const conditionNone = document.getElementById('condition-none');
    const conditionCheckboxes = document.querySelectorAll('input[name="conditions"]');
    
    if (conditionNone && conditionCheckboxes.length > 0) {
        conditionNone.addEventListener('change', function() {
            if (this.checked) {
                conditionCheckboxes.forEach(checkbox => {
                    if (checkbox !== this) {
                        checkbox.checked = false;
                        
                        // If "Other" is unchecked, hide its text field
                        if (checkbox.id === 'condition-other') {
                            document.getElementById('condition-other-container').style.display = 'none';
                            document.getElementById('condition-other-text').value = '';
                        }
                    }
                });
            }
        });
        
        // If any other condition is checked, uncheck "None"
        conditionCheckboxes.forEach(checkbox => {
            if (checkbox !== conditionNone) {
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        conditionNone.checked = false;
                    }
                });
            }
        });
    }
    
    // Form submission handler with nutrient calculations
    const form = document.getElementById('survey-form');
    
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = "Processing...";
            submitButton.disabled = true;
            
            // Collect all form data
            const formData = new FormData(this);
            let formDataObj = {};
            
            // Process checkbox groups (usage, conditions)
            formDataObj.usage = formData.getAll('usage').join(', ');
            formDataObj.conditions = formData.getAll('conditions').join(', ');
            
            // Process all other form fields
            for (const [key, value] of formData.entries()) {
                if (key !== 'usage' && key !== 'conditions') {
                    formDataObj[key] = value;
                }
            }

            // Convert nutrient intake values to daily servings
            formDataObj = calculateDailyServings(formDataObj);
            
            // Calculate nutrient intake based on form data
            const nutrientValues = calculateNutrientIntake(formDataObj);
            
            // Add nutrient values directly to the form data
            formDataObj.estimated_sodium_mg = nutrientValues.sodium_mg;
            formDataObj.estimated_potassium_mg = nutrientValues.potassium_mg;
            formDataObj.estimated_magnesium_mg = nutrientValues.magnesium_mg;
            formDataObj.estimated_calcium_mg = nutrientValues.calcium_mg;
            formDataObj.chloride_deficit_mg = nutrientValues.chloride_deficit_mg;
            
            // Create DRI JSON object based on user data
            const driJson = {
              summary: `${formDataObj.age}-year-old ${formDataObj['biological-sex']} with ${formDataObj['sweat-level']} sweat levels and ${formDataObj.conditions.includes('hypertension') ? 'family history of hypertension' : 'no family history of hypertension'}.`,
              daily_recommendations: {
                sodium_mg: calculateSodiumDRI(formDataObj),
                potassium_mg: calculatePotassiumDRI(formDataObj),
                magnesium_mg: calculateMagnesiumDRI(formDataObj),
                calcium_mg: calculateCalciumDRI(formDataObj)
              }
            };

            // Create consumption JSON object
            const consumptionJson = {
              summary: "Estimated daily intake of nutrients based on reported servings and supplements.",
              estimated_daily_intake: {
                sodium_mg: nutrientValues.sodium_mg,
                potassium_mg: nutrientValues.potassium_mg,
                magnesium_mg: nutrientValues.magnesium_mg,
                calcium_mg: nutrientValues.calcium_mg
              },
              chloride_deficit_mg: nutrientValues.chloride_deficit_mg
            };

            // Calculate remaining nutrients needed
            const remainingNutrients = calculateRemainingNutrients(driJson, consumptionJson);

            // Add the remaining nutrients data to form data
            formDataObj.remaining_nutrients = remainingNutrients;
            formDataObj.dri_values = JSON.stringify(driJson);
            formDataObj.consumption_values = JSON.stringify(consumptionJson);
            
            // Log the data being sent (for debugging)
            console.log("Form data being sent:", formDataObj);
            console.log("DRI values:", driJson);
            console.log("Consumption values:", consumptionJson);
            console.log("Remaining nutrients:", remainingNutrients);
            
            // Convert to URL parameters for Google Apps Script
            const formDataParams = new URLSearchParams();
            Object.keys(formDataObj).forEach(key => {
                formDataParams.append(key, formDataObj[key]);
            });
            
            // Your Google Apps Script Web App URL
            const scriptURL = 'https://script.google.com/macros/s/AKfycbyLb6zWh1Xd5rRR8Kq27n886-RaUyz8YzqZGabBhoHaGxIfJqmQ0q3zvBWGjbQYnM-5/exec';
            
            // Send as URL-encoded form data
            fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formDataParams
            })
            .then(() => {
                // Show success message
                const responseMessage = document.getElementById('response-message');
                responseMessage.textContent = "Thank you for completing the survey! We'll create your personalized electrolyte mix and send the details to your email.";
                responseMessage.className = 'success-message';
                
                // Add a restart button
                const restartButton = document.createElement('button');
                restartButton.textContent = "Take Survey Again";
                restartButton.className = "restart-button";
                restartButton.addEventListener('click', function() {
                    form.reset();
                    resetSurveyForm();
                    responseMessage.textContent = "";
                    responseMessage.className = "";
                    restartButton.remove();
                });
                responseMessage.parentNode.insertBefore(restartButton, responseMessage.nextSibling);
                
                // Reset form
                form.reset();
                resetSurveyForm();
                
                // Scroll to response message
                responseMessage.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                console.error('Error:', error);
                const responseMessage = document.getElementById('response-message');
                responseMessage.textContent = "There was a problem submitting your survey. Please try again or contact us for assistance.";
                responseMessage.className = 'error-message';
            })
            .finally(() => {
                // Restore button state
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }
});

// Function to convert servings per week to daily values
function calculateDailyServings(formDataObj) {
  // Array of nutrient intake fields
  const nutrientFields = ['sodium-intake', 'potassium-intake', 'magnesium-intake', 'calcium-intake'];
  
  // Clone the original data object to avoid modifying it directly
  const convertedData = {...formDataObj};
  
  nutrientFields.forEach(field => {
    const value = formDataObj[field];
    
    if (value) {
      let dailyValue;
      
      // Convert string values to numeric daily values
      if (value === '0') {
        dailyValue = 0;
      } else if (value === '1-3') {
        // Average of 1-3 servings per week = 2 / 7 days
        dailyValue = (2 / 7).toFixed(2);
      } else if (value === '4-6') {
        // Average of 4-6 servings per week = 5 / 7 days
        dailyValue = (5 / 7).toFixed(2);
      } else if (value === '7') {
        // 7 servings per week = 1 per day
        dailyValue = 1;
      } else if (value === '14') {
        // 14 servings per week = 2 per day
        dailyValue = 2;
      } else if (value === '21') {
        // 21 servings per week = 3 per day
        dailyValue = 3;
      } else if (value === '28') {
        // 28 servings per week = 4 per day
        dailyValue = 4;
      } else if (value === '35+') {
        // 35+ servings per week = 5+ per day
        dailyValue = 5;
      } else {
        // For any other values, use as is
        dailyValue = value;
      }
      
      // Add a new field with the daily value
      convertedData[field + '-daily'] = dailyValue;
    }
  });
  
  return convertedData;
}

// Function to calculate nutrient intakes based on daily servings and supplements
function calculateNutrientIntake(formData) {
  // Extract daily serving values (already calculated in your existing code)
  const sodiumServings = parseFloat(formData['sodium-intake-daily']) || 0;
  const potassiumServings = parseFloat(formData['potassium-intake-daily']) || 0;
  const magnesiumServings = parseFloat(formData['magnesium-intake-daily']) || 0;
  const calciumServings = parseFloat(formData['calcium-intake-daily']) || 0;
  
  // Coefficient values for each nutrient (mg per serving)
  const SODIUM_COEFFICIENT = 619;
  const POTASSIUM_COEFFICIENT = 323;
  const MAGNESIUM_COEFFICIENT = 71;
  const CALCIUM_COEFFICIENT = 168;
  
  // Calculate base nutrient intake from food (without supplements)
  const sodiumFromFood = sodiumServings * SODIUM_COEFFICIENT;
  const potassiumFromFood = potassiumServings * POTASSIUM_COEFFICIENT;
  const magnesiumFromFood = magnesiumServings * MAGNESIUM_COEFFICIENT;
  const calciumFromFood = calciumServings * CALCIUM_COEFFICIENT;
  
  // Parse supplement intake information
  let supplementSodium = 0;
  let supplementPotassium = 0;
  let supplementMagnesium = 0;
  let supplementCalcium = 0;
  
  // Parse supplement text if provided
  if (formData.supplements && formData.supplements.trim() !== '') {
    // Extract numeric values followed by "mg" or "g" and the nutrient name
    const supplementText = formData.supplements.toLowerCase();
    
    // Function to extract milligram amounts for a given nutrient
    const extractAmount = (text, nutrientName) => {
      // Match patterns like "500mg sodium" or "1g sodium" or "sodium 500mg"
      const mgRegex = new RegExp(`(\\d+)\\s*mg\\s*${nutrientName}|${nutrientName}\\s*(\\d+)\\s*mg`, 'i');
      const gRegex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*g\\s*${nutrientName}|${nutrientName}\\s*(\\d+(?:\\.\\d+)?)\\s*g`, 'i');
      
      let amount = 0;
      
      // Check for milligram amounts
      const mgMatch = text.match(mgRegex);
      if (mgMatch) {
        // The value could be in either capture group depending on word order
        amount = parseInt(mgMatch[1] || mgMatch[2], 10);
      }
      
      // Check for gram amounts and convert to mg
      const gMatch = text.match(gRegex);
      if (gMatch) {
        // The value could be in either capture group depending on word order
        amount = parseFloat(gMatch[1] || gMatch[2]) * 1000;
      }
      
      return amount;
    };
    
    // Extract supplement amounts for each nutrient
    supplementSodium = extractAmount(supplementText, 'sodium');
    supplementPotassium = extractAmount(supplementText, 'potassium');
    supplementMagnesium = extractAmount(supplementText, 'magnesium');
    supplementCalcium = extractAmount(supplementText, 'calcium');
  }
  
  // Calculate total nutrient intake including supplements
  const totalSodium = sodiumFromFood + supplementSodium;
  const totalPotassium = potassiumFromFood + supplementPotassium;
  const totalMagnesium = magnesiumFromFood + supplementMagnesium;
  const totalCalcium = calciumFromFood + supplementCalcium;
  
  // Calculate chloride deficit based on sodium from food only
  const chlorideDeficit = sodiumFromFood * 0.062;
  
  // Return the calculated values directly
  return {
    sodium_mg: Math.round(totalSodium),
    potassium_mg: Math.round(totalPotassium),
    magnesium_mg: Math.round(totalMagnesium),
    calcium_mg: Math.round(totalCalcium),
    chloride_deficit_mg: Math.round(chlorideDeficit),
    // Also return the from-food values in case they're needed
    sodium_from_food_mg: Math.round(sodiumFromFood),
    potassium_from_food_mg: Math.round(potassiumFromFood),
    magnesium_from_food_mg: Math.round(magnesiumFromFood),
    calcium_from_food_mg: Math.round(calciumFromFood)
  };
}

// Calculate Sodium DRI based on user data
function calculateSodiumDRI(userData) {
  // Base recommendation
  let sodium = 2300; // mg, general recommendation
  
  // Adjust based on sweat level
  if (userData['sweat-level'] === 'heavy' || userData['sweat-level'] === 'excessive') {
    sodium = 3000;
  } else if (userData['sweat-level'] === 'minimal') {
    sodium = 1800;
  }
  
  // Adjust based on health conditions
  if (userData.conditions.includes('hypertension') || userData.conditions.includes('heart-disease')) {
    sodium = Math.min(sodium, 1500); // Lower if hypertension or heart disease
  }
  
  return sodium;
}

// Calculate Potassium DRI based on user data
function calculatePotassiumDRI(userData) {
  // Base recommendations by sex
  let potassium = userData['biological-sex'] === 'male' ? 3400 : 2600; // mg
  
  // Adjust based on activity level and sweat
  if (userData['activity-level'] === 'very-active' || 
      userData['sweat-level'] === 'heavy' || 
      userData['sweat-level'] === 'excessive') {
    potassium += 800; // Add more for active people who sweat a lot
  }
  
  return potassium;
}

// Calculate Magnesium DRI based on user data
function calculateMagnesiumDRI(userData) {
  // Base recommendations by sex and age
  let magnesium;
  const age = parseInt(userData.age);
  
  if (userData['biological-sex'] === 'male') {
    if (age < 30) magnesium = 400;
    else if (age < 50) magnesium = 420;
    else magnesium = 420;
  } else { // female
    if (age < 30) magnesium = 310;
    else if (age < 50) magnesium = 320;
    else magnesium = 320;
  }
  
  // Adjust for activity level
  if (userData['activity-level'] === 'very-active') {
    magnesium *= 1.2; // 20% increase for very active individuals
  }
  
  return Math.round(magnesium);
}

// Calculate Calcium DRI based on user data
function calculateCalciumDRI(userData) {
  // Base recommendations by age
  let calcium;
  const age = parseInt(userData.age);
  
  if (age < 19) calcium = 1300;
  else if (age < 50) calcium = 1000;
  else if (age < 70) calcium = 1000;
  else calcium = 1200;
  
  return calcium;
}

// Function to calculate remaining nutrient needs
function calculateRemainingNutrients(driJson, consumptionJson) {
  try {
    // Parse inputs if they're strings
    const dri = typeof driJson === 'string' ? JSON.parse(driJson) : driJson;
    const consumption = typeof consumptionJson === 'string' ? JSON.parse(consumptionJson) : consumptionJson;
    
    // Validate inputs
    if (!dri.daily_recommendations || !consumption.estimated_daily_intake) {
      throw new Error("Invalid input format: missing required fields");
    }
    
    const recommendations = dri.daily_recommendations;
    const intake = consumption.estimated_daily_intake;
    
    const results = [];
    
    // Calculate remaining needs for each nutrient
    for (const [nutrient, recommendedAmount] of Object.entries(recommendations)) {
      const currentIntake = intake[nutrient] || 0;
      const remaining = recommendedAmount - currentIntake;
      
      // Extract unit from nutrient name
      const unit = nutrient.includes('_mg') ? 'mg' : 
                   nutrient.includes('_IU') ? 'IU' : '';
      
      // Format nutrient name for display
      const nutrientName = nutrient.split('_')[0].charAt(0).toUpperCase() + 
                          nutrient.split('_')[0].slice(1);
      
      if (remaining <= 0) {
        results.push(`${nutrientName}: No additional intake needed.`);
      } else {
        results.push(`${nutrientName}: ${remaining.toFixed(2)} ${unit} remaining`);
      }
    }
    
    return results.join('\n');
  } catch (error) {
    console.error("Error processing nutrient data:", error);
    return "Error calculating remaining nutrients. Please check input format.";
  }
}

// Function to reset the survey form to its initial state
function resetSurveyForm() {
  // Reset form to first section
  const sections = document.querySelectorAll('.form-section');
  sections.forEach(section => section.classList.remove('active-section'));
  if (sections.length > 0) {
    sections[0].classList.add('active-section');
  }
  
  // Reset progress bar
  const progressBar = document.getElementById('form-progress');
  if (progressBar) {
    progressBar.style.width = '20%'; // First step
  }
  
  // Reset progress labels
  const progressLabels = document.querySelectorAll('.progress-label');
  progressLabels.forEach(label => label.classList.remove('active'));
  if (progressLabels.length > 0) {
    progressLabels[0].classList.add('active');
  }
  
  // Reset any shown "Other" fields
  document.getElementById('usage-other-container').style.display = 'none';
  document.getElementById('condition-other-container').style.display = 'none';
  document.getElementById('flavor-other-container').style.display = 'none';
  document.getElementById('sweetener-type-container').style.display = 'none';
  
  // Clear any validation error messages
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach(msg => msg.remove());
  
  // Remove invalid class from any fields
  const invalidFields = document.querySelectorAll('.invalid');
  invalidFields.forEach(field => field.classList.remove('invalid'));
}
