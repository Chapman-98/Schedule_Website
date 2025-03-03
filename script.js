document.addEventListener('DOMContentLoaded', () => 
{
    const calendar = document.getElementById('calendar');

    const today = new Date();
    const currentMonth = today.getMonth();  // 0 = January, ..., 11 = December
    const currentYear = today.getFullYear();

    //Add a drag that will show the time as well so like going down it will show the time even if it is not on the side.

    // Get the first day of the month (0 = Sunday, 6 = Saturday)
    let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    firstDayOfMonth -= 1;

    if(firstDayOfMonth == -1)
    {
        firstDayOfMonth = 6;
    } 
    
    // Will be used to make sure that the block for next month that contains the same date is not highlighted too
    let currentDateSeen = false; 

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
});