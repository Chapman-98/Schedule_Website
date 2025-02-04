document.addEventListener('DOMContentLoaded', () => 
{
    const calendar = document.getElementById('calendar');

    const today = new Date();
    const currentMonth = today.getMonth();  // 0 = January, ..., 11 = December
    const currentYear = today.getFullYear();

    // Get the first day of the month (0 = Sunday, 6 = Saturday)
    let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    firstDayOfMonth -= 1;

    if(firstDayOfMonth == -1)
    {
        firstDayOfMonth = 6;
    }
   
    

    // Get the number of days in the month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Define settings for the month view:
    let totalCells = 35;     // 7 days x 6 weeks grid (commonly used for calendars)
   
    if((daysInMonth + (firstDayOfMonth + 1)) > totalCells)
    {
        totalCells = 42;
    }

    let dayNumber = 0;
    for (let i = 0; i < totalCells; i++) 
    {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day');
  
        // Check if we have started the current month
        if(i >= firstDayOfMonth) 
        {
            // Fill in the cells that represent actual days of the month.
            if(i < firstDayOfMonth + daysInMonth)
            {
                dayNumber = i - firstDayOfMonth + 1;
            }
            else
            {            
                dayNumber = i - firstDayOfMonth - daysInMonth + 1;
            }

            dayCell.dataset.day = dayNumber;
            dayCell.innerHTML = `<strong>${dayNumber}</strong>`;

            // Create a tasks container and append it to the day cell
            const assignmentContainer = document.createElement('div');
            assignmentContainer.classList.add('assignments');
            dayCell.appendChild(assignmentContainer);

            // Add click event to allow assignment input.
            dayCell.addEventListener('click', () => 
            {
                // Create a div for the prompt
                const promptDiv = document.createElement('div');
                promptDiv.classList.add('custom-prompt');

                promptDiv.innerHTML = `
                    <div style="background:#eee; padding:10px; border:1px solid #ccc; position:fixed; top:30%; left:50%; transform:translate(-50%, -50%);">
                        <p>Choose which class has an Assignment:</p>
                        <label><input type="radio" name="choice" value="1"> CS 468</label><br>
                        <label><input type="radio" name="choice" value="2"> CS 471</label><br>
                        <label><input type="radio" name="choice" value="3"> CS 480</label><br>
                        <label><input type="radio" name="choice" value="4"> SWE 437</label><br>
                        <label><input type="radio" name="choice" value="5"> Yoga</label><br>
                        <button id="confirmSelection">Confirm</button>
                    </div>`;

                // Append the prompt to the document body
                document.body.appendChild(promptDiv);

                // Check when confirm has been selected
                promptDiv.querySelector('#confirmSelection').addEventListener('click', () => 
                {
                    // Check that an option was selected
                    const selectedInput = promptDiv.querySelector('input[name="choice"]:checked');
                    if (!selectedInput) 
                    {
                        alert("Please select an option!");
                        return;
                    }
                    const selectedChoice = selectedInput.value;
                    
                    // Get the assignment details.
                    let assignment = prompt(`Enter assignment details for the day:`);
                    if (assignment !== null) 
                    {
                        // Map the selectedChoice to a color
                        let color;
                        switch (selectedChoice) 
                        {
                            case "1":
                                color = "#ea9999";
                                break;
                            case "2":
                                color = "#6fa8dc";
                                break;
                            case "3":
                                color = "#8e7cc3";
                                break;
                            case "4":
                                color = "#f6b26b" 
                                break;
                            case "5":
                                color = "#b5651d"
                                break;
                            default:
                                color = "black";
                        }
                    
                        // Create an assignment element that will be inside the day cell
                        const assignmentElement = document.createElement('span');
                        dayCell.classList.add('assignment');
                        assignmentElement.style.color = color;
                        assignmentElement.textContent = assignment;

                        // Append the assignment element into it's container so that the user can have multiple assignments on a single day
                        const assignmentContainer = dayCell.querySelector('.assignments')
                        assignmentContainer.appendChild(assignmentElement);
                        assignmentContainer.appendChild(document.createElement('br'));   
                    }
                    // Remove the custom prompt from the document.
                    promptDiv.remove();
                });
            });
        }
        calendar.appendChild(dayCell);
    }
});
  