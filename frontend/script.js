document.addEventListener('DOMContentLoaded', () => 
{
    console.log("found");
    calendar();
});

async function calendar() 
{
    // Fetch the current data in the database
    const assignments = await fetchData();

    const calendar = document.getElementById('calendar');    
    const today = new Date();
    const currentMonth = today.getMonth();  // 0 = January, ..., 11 = December
    const currentYear = today.getFullYear();


    // Get the first day of the month (0 = Sunday, 6 = Saturday)
    let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Subtract because weeks start on Monday
    firstDayOfMonth -= 1; 


    if(firstDayOfMonth == -1)
    {
        firstDayOfMonth = 6;
    } 
    
    // Will be used to make sure that the block for next month that contains the same date is not highlighted too
    let currentDateSeen = false; 

    // Setting day to 0 gets the last day of last month which is why month is +1
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Get total days of last month
    const daysLastMonth = new Date(currentYear, currentMonth, 0).getDate(); 

    // Sets total days in calendar
    let totalCells = 35;    

    // Checks if there is a need for another week to be added to the calendar
    if((daysInMonth + (firstDayOfMonth + 1)) > totalCells)
    {
        totalCells = 42;
    }

    
    let dayNumber = 0;
    let daysAssignment;
    for(let i = 0; i < totalCells; i++) 
    {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day');

        // Fill in last months cells
        if(i < firstDayOfMonth)
        {
            dayNumber = daysLastMonth - firstDayOfMonth + i + 1;
            dayCell.dataset.month = currentMonth - 1;
        }
        // Fill in the cells that represent actual days of the month.
        else if(i < firstDayOfMonth + daysInMonth)
        {
            dayNumber = i - firstDayOfMonth + 1;
            dayCell.dataset.month = currentMonth;
            daysAssignment = assignments.find(({day}) => day === dayNumber);
            console.log(daysAssignment);
        }
        // Fill in the cells that represent days of next month.
        else
        {            
            dayNumber = i - firstDayOfMonth - daysInMonth + 1;
            dayCell.dataset.month = currentMonth + 1;
        }

        /* 
            Easy way would to have a CSV file and keep using it and saving with it.
            More efficient would be to save month at creation and simply keep reloading it 
        */

        // Set the background for todays date.
        if(dayNumber == today.getDate() && !currentDateSeen)
        {
            currentDateSeen = true;
            dayCell.style.backgroundColor = "#f4cccc";
        }

        // Set the day in div and write it bold into the day cell
        dayCell.dataset.day = dayNumber;
        dayCell.innerHTML = `<strong>${dayNumber}</strong>`;

        // Create a tasks container and append it to the day cell
        const assignmentContainer = document.createElement('div');
        assignmentContainer.classList.add('assignments');
        dayCell.appendChild(assignmentContainer);


        if(daysAssignment)
        {
            // Create an assignment element that will be inside the day cell
            const assignmentElement = document.createElement('span');
            assignmentElement.style.color = daysAssignment.style;
            assignmentElement.textContent = daysAssignment.assignmentName;

            // Append the assignment element into it's container so that the user can have multiple assignments on a single day
            const assignmentContainer = dayCell.querySelector('.assignments')
            assignmentContainer.appendChild(assignmentElement);
            assignmentContainer.appendChild(document.createElement('br'));   
        }

        // Add click event to allow assignment input.
        dayCell.addEventListener('click', async () => 
        {
            // To tell if password is incorrect
            let incorrect = 0;

            await (async () =>
            {
                const password = await askForPassword();
                const correct = await checkPassword(password);

                if(!correct)
                {
                    console.log("Password incorrect");
                    // Create a div for the prompt
                    const promptDiv = document.createElement('div');
                    promptDiv.classList.add('incorrect-password');

                    promptDiv.innerHTML = `
                    <div style="background:#eee; padding:10px; border:1px solid #ccc; position:fixed; top:30%; left:50%; transform:translate(-50%, -50%);">
                        <p>Incorrect Password</p>
                    </div>`;

                    // Append the prompt to the document body
                    document.body.appendChild(promptDiv);  
                    incorrect = 1;
                }
            })();

            if(incorrect == 1) {return;}

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
                let assignmentName = prompt(`Enter assignment details for the day:`);
                if (assignmentName !== null) 
                {
                    // Map the selectedChoice to a color
                    let color;
                    switch (selectedChoice) 
                    {
                        case "1":
                            color = "#e0666";
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
                    assignmentElement.textContent = assignmentName;

                    // Append the assignment element into it's container so that the user can have multiple assignments on a single day
                    const assignmentContainer = dayCell.querySelector('.assignments')
                    assignmentContainer.appendChild(assignmentElement);
                    assignmentContainer.appendChild(document.createElement('br'));   

                    assignmentObject =
                    {
                        month: dayCell.getAttribute("data-month"), 
                        day: dayCell.getAttribute("data-day"), 
                        style: color, 
                        assignmentName: assignmentName
                    };
                    
                    fetch('/data', 
                    {
                        method: 'POST',
                        headers: 
                        {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(assignmentObject)
                    })
                    .then(response => response.json())
                    .then(data => 
                    {
                        console.log('POST response:', data);
                        // Process the response, e.g., update the UI or confirm receipt
                    })
                    .catch(error => 
                    {
                        console.error('Error sending data:', error);
                    });

                    console.log(assignmentObject);
                }
                // Remove the custom prompt from the document.
                promptDiv.remove();
            });
        });
        calendar.appendChild(dayCell);
    }

    const activities = document.querySelector('.activities');

    // --- Variables for drawing a new overlay ---
    let isDrawing = false;
    let drawStartX = 0;
    let drawStartY = 0;
    let currentDrawingOverlay = null;
    
    // Global variables for dragging and resizing
    let currentDragOverlay = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    
    let currentResizeOverlay = null;
    let resizeStartWidth = 0;
    let resizeStartHeight = 0;
    let resizeStartX = 0;
    let resizeStartY = 0;

    // Create an overlay when clicking directly on the activities container.
    activities.addEventListener('mousedown', function(e) 
    {
        console.log("Mousedown fired");

        // Ensure the click is not on an existing overlay or its children.
        if(e.currentTarget !== activities) return;
        

        
        // Determine click position relative to the activities container.
        const rect = activities.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create the overlay element.
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        //overlay.style.left = x + 'px';
        overlay.style.top = y + 'px';
        //overlay.style.width = '100px';  // Default width
        //overlay.style.height = '50px';  // Default height
    
        // Create a resize handle and add it to the overlay.
        const handle = document.createElement('div');
        overlay.appendChild(handle);
    
        // Append the overlay to the activities container.
        activities.appendChild(overlay);
    
    
        // --- DRAGGING FUNCTIONALITY ---
        // When the mouse is pressed on the overlay (but not on the resize handle), start dragging.
        overlay.addEventListener('mousedown', function(ev) 
        {
            // If the user clicks on the resize handle, ignore this mousedown.
            if (ev.target.classList.contains('resize-handle')) return;
            currentDragOverlay = overlay;
            const overlayRect = overlay.getBoundingClientRect();
            dragOffsetX = ev.clientX - overlayRect.left;
            dragOffsetY = ev.clientY - overlayRect.top;
            ev.preventDefault();
        });
    
        // --- RESIZING FUNCTIONALITY ---
        // When the mouse is pressed on the resize handle, start resizing.
        handle.addEventListener('mousedown', function(ev) 
        {
            currentResizeOverlay = overlay;
            resizeStartWidth = overlay.offsetWidth;
            resizeStartHeight = overlay.offsetHeight;
            resizeStartX = ev.clientX;
            resizeStartY = ev.clientY;
            // Prevent the drag handler from also firing.
            ev.stopPropagation();
            ev.preventDefault();
        });
    
    

        // Global mousemove handler for dragging and resizing.
        document.addEventListener('mousemove', function(e) 
        {
            // Handle dragging
            if (currentDragOverlay) 
            {
                const activitiesRect = activities.getBoundingClientRect();
                let newLeft = e.clientX - activitiesRect.left - dragOffsetX;
                let newTop = e.clientY - activitiesRect.top - dragOffsetY;
                
                // Optional: Clamp to keep the overlay within the container.
                newLeft = Math.max(newLeft, 0);
                newTop = Math.max(newTop, 0);
                newLeft = Math.min(newLeft, activities.clientWidth - currentDragOverlay.offsetWidth);
                newTop = Math.min(newTop, activities.clientHeight - currentDragOverlay.offsetHeight);
                
                currentDragOverlay.style.left = newLeft + 'px';
                currentDragOverlay.style.top = newTop + 'px';
            }
            
            // Handle resizing
            if (currentResizeOverlay) 
            {
                let newWidth = resizeStartWidth + (e.clientX - resizeStartX);
                let newHeight = resizeStartHeight + (e.clientY - resizeStartY);
                // Set minimum dimensions
                newWidth = Math.max(newWidth, 50);
                newHeight = Math.max(newHeight, 30);
                
                // Optional: Clamp the overlay size so it doesn't extend outside the container.
                const overlayLeft = parseInt(currentResizeOverlay.style.left, 10);
                const overlayTop = parseInt(currentResizeOverlay.style.top, 10);
                newWidth = Math.min(newWidth, activities.clientWidth - overlayLeft);
                newHeight = Math.min(newHeight, activities.clientHeight - overlayTop);
                
                currentResizeOverlay.style.width = newWidth + 'px';
                currentResizeOverlay.style.height = newHeight + 'px';
            }
        });
    });
    
    // Global mouseup handler to stop dragging/resizing.
    document.addEventListener('mouseup', function(e) 
    {
        currentDragOverlay = null;
        currentResizeOverlay = null;
    });
}
    
async function fetchData() 
{
    try 
    {
        const response = await fetch('/data');
        const data = await response.json();
        console.log('GET response:', data);
        return data.data; 
    } 
    catch(error) 
    {
        console.error('Error fetching data:', error);
        throw error; // Optionally re-throw the error
    }
}

async function checkPassword(password)
{
    passwordObject =
    {
        password: password
    }
    console.log(passwordObject.password);
    try 
    {
        const response = await fetch('/password',
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(passwordObject)
        });

        const data = await response.json();
        console.log('GET response:', data);
        return data.data; 
    } 
    catch(error) 
    {
        console.error('Error fetching data:', error);
        throw error; // Optionally re-throw the error
    }
}

async function askForPassword()
{
    return new Promise(resolve => 
    {
        const promptDiv = document.createElement('div');
        promptDiv.classList.add('custom-prompt');

        promptDiv.innerHTML = `
            <div style="background:#eee; padding:20px; border:1px solid #ccc; position:fixed; top:30%; left:50%; transform:translate(-50%, -50%); z-index:1000; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
                <p>Enter the password to make an edit:</p>
                <input type="password" id="passwordInput" required><br><br>
                <button id="confirmSelection">Confirm</button>
                <button id="cancelSelection">Cancel</button>
            </div>`;

        // Append the prompt to the document body
        document.body.appendChild(promptDiv);

        document.getElementById('confirmSelection').onclick = () => 
        {
            const password = document.getElementById('passwordInput').value;
            promptDiv.remove(); 
            resolve(password);
        };

        document.getElementById('cancelSelection').onclick = () => {
            promptDiv.remove();
            resolve(null); 
        };
    });
}

