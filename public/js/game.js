async function getGames() {
    try {
        const response = await fetch('/games');

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const games = await response.json();

        if (games.length === 0) {
            document.getElementById('gamesList').innerHTML = '<p>No games found.</p>';
            return;
        }

        let output = '<table>';
        output += '<tr><th>Edit</th><th>Delete</th><th>AppID</th><th>Title</th><th>Genre</th><th>Developers</th><th>Release Date</th></tr>';

        games.forEach(game => {
            output += `
                <tr>
                    <td><button onclick="editGame(${game.AppID}, '${game.Name}')">Edit</button></td>
                    <td><button onclick="deleteGame(${game.AppID})">Delete</button></td>
                    <td style="text-align:center; padding: 10px;">${game.AppID}</td>
                    <td style="text-align:center; padding: 10px;">${game.Name}</td>
                    <td style="text-align:center; padding: 10px;">${game.Genres}</td>
                    <td style="text-align:center; padding: 10px;">${game.Developers}</td>
                    <td style="text-align:center; padding: 10px;">${game.release_date}</td>

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
                        <td><button onclick="editGame(${game.AppID}, '${game.Name}')">Edit</button></td>
                        <td><button onclick="deleteGame(${game.AppID})">Delete</button></td>
                        <td style="text-align:center; padding: 10px;">${game.AppID}</td>
                        <td style="text-align:center; padding: 10px;">${game.Name}</td>
                        <td style="text-align:center; padding: 10px;">${game.Genres}</td>
                        <td style="text-align:center; padding: 10px;">${game.Developers}</td>
                        <td style="text-align:center; padding: 10px;">${game.release_date}</td>
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

// Edit a game title
async function editGame(appID, currentName) {
    const newName = prompt(`Edit the title for game with AppID: ${appID}\nCurrent title: ${currentName}`, currentName);

    if (newName && newName !== currentName) {
        try {
            const response = await fetch(`/games/${appID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const result = await response.json();
            alert(result.message);
            getGames(); // Refresh the list after updating
        } catch (error) {
            console.error('Error updating game title:', error);
            alert('Failed to update game title. Please try again later.');
        }
    }
}

// Delete a game 
async function deleteGame(appID) {
    const confirmation = confirm(`Are you sure you want to delete this game?`);
    
    if (!confirmation) {
        return; 
    }

    try {
        const response = await fetch(`/games/${appID}`, {
            method: 'DELETE',  // Use DELETE instead of PUT
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        alert(result.message); // Inform user of successful deletion
        getGames(); // Refresh the list after deleting the game
    } catch (error) {
        console.error('Error deleting game:', error);
        alert('Failed to delete game. Please try again later.');
    }
}
