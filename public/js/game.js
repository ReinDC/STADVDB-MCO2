async function getGames() {
    try {
        const response = await fetch('/games');
        
        // If the response status is not OK, throw an error
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const games = await response.json();

        if (games.length === 0) {
            document.getElementById('gamesList').innerHTML = '<p>No games found.</p>';
            return;
        }

        // Create table structure
        let output = '<table>';
        output += '<tr><th>Edit</th><th>AppID</th><th>Title</th><th>Genre</th><th>Developers</th></tr>';  

        games.forEach(game => {
            // Ensure 'Name' and 'Genres' match the properties from your database
            output += 
            `   <tr>
                <td><button onclick="editGame(${game.AppID})">Edit</button></td>
                <td style="text-align:center; padding: 10px;">${game.AppID}</td>
                <td style="text-align:center; padding: 10px;">${game.Name}</td>
                <td style="text-align:center; padding: 10px;">${game.Genres}</td>
                <td style="text-align:center; padding: 10px;">${game.Developers}</td>
                </tr>`;
        });

        output += '</table>';
        document.getElementById('gamesList').innerHTML = output; 

    } catch (error) {
        console.error('Error fetching games:', error);
        document.getElementById('gamesList').innerHTML = '<p>Failed to fetch games. Please try again later.</p>';
    }
}


async function gameSearch() {
    const searchValue = document.getElementById('search').value; // Get the value from the search input
    const url = searchValue ? `/search/games?name=${encodeURIComponent(searchValue)}` : '/games'; // Append search query if there is a search term

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const games = await response.json();

        if (games.length === 0) {
            document.getElementById('gamesList').innerHTML = '<p>No games found.</p>';
            return;
        }

        // let output = '<ul>';
        // games.forEach(game => {
        //     output += `<li>${game.Name} - ${game.Genres}</li>`;
        // });
        // output += '</ul>';

        // document.getElementById('gamesList').innerHTML = output;

        let output = '<table>';
        output += '<tr><th></th><th>AppID</th><th>Title</th><th>Genre</th></th><th>Developers</th></tr>';  
            games.forEach(game => {
                // Ensure 'Name' and 'Genres' match the properties from your database
                output += 
                `   <tr>
                    <td><button onclick="">Edit</button></td>
                    <td style= "text-align:center; padding: 10px;">${game.AppID}</td>
                    <td style= "text-align:center; padding: 10px;">${game.Name}</td>
                    <td style= "text-align:center; padding: 10px;">${game.Genres}</td>
                    <td style= "text-align:center; padding: 10px;">${game.Developers}</td>
                    </tr>`;
            });
            output += '</table>';

        document.getElementById('gamesList').innerHTML = output;

    } catch (error) {
        console.error('Error fetching games:', error);
        document.getElementById('gamesList').innerHTML = '<p>Failed to fetch games. Please try again later.</p>';
    }
}

async function AppIDSearch() {
    const searchValue = document.getElementById('appId_search').value.trim(); // Get the value from the search input and trim whitespace
    if (!searchValue) {
        document.getElementById('gamesList').innerHTML = "<p>Please enter an AppID to search.</p>";
        return;
    }

    const url = `/search/appID?AppId=${encodeURIComponent(searchValue)}`;
    document.getElementById('gamesList').innerHTML = ""; // Clear previous results
    
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const games = await response.json();

        if (games.length === 0) {
            document.getElementById('gamesList').innerHTML = '<p>No game found with that AppID.</p>';
            return;
        }

        let output = '<table>';
        output += '<tr><th></th><th>AppID</th><th>Title</th><th>Genre</th><th>Developers</th></tr>'; // Fixed extra </th>
        
        games.forEach(game => {
            output += `
                <tr>
                    <td><button onclick="editGame(${game.AppID}, '${game.Name}')">Edit</button></td>
                    <td style="text-align:center; padding: 10px;">${game.AppID}</td>
                    <td style="text-align:center; padding: 10px;">${game.Name}</td>
                    <td style="text-align:center; padding: 10px;">${game.Genres}</td>
                    <td style="text-align:center; padding: 10px;">${game.Developers}</td>
                </tr>
            `;
        });
        output += '</table>';

        document.getElementById('gamesList').innerHTML = output;

    } catch (error) {
        console.error('Error fetching games:', error);
        document.getElementById('gamesList').innerHTML = '<p>Failed to fetch games. Please try again later.</p>';
    }
}

function editGame(appId, name) {
    const title = document.createElement('h3');

    // Set the text content of the <p> element
    title.textContent = "Edit details of " + name;

    const input = document.createElement('input');
    input.type = 'text'; // or 'number', 'password', etc.
    input.name = 'gameTitle'; // Set any other attributes as needed
    input.placeholder = 'Enter game title';

    document.getElementById('edit-area').appendChild(title);
    document.getElementById('edit-area').appendChild(input); // Append it to a parent element
}





