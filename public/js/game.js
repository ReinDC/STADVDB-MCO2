// Fetch and display all games
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
        output += '<tr><th>Edit</th><th>AppID</th><th>Title</th><th>Genre</th><th>Developers</th></tr>';

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

// Search games by name
async function gameSearch() {
    const searchValue = document.getElementById('search').value;
    const url = searchValue ? `/search/games?name=${encodeURIComponent(searchValue)}` : '/games';

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

        let output = '<table>';
        output += '<tr><th>Edit</th><th>AppID</th><th>Title</th><th>Genre</th><th>Developers</th></tr>';

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

// Search games by AppID
async function AppIDSearch() {
    const searchValue = document.getElementById('appId_search').value.trim();

    if (!searchValue) {
        document.getElementById('gamesList').innerHTML = '<p>Please enter an AppID to search.</p>';
        return;
    }

    const url = `/search/appID?AppId=${encodeURIComponent(searchValue)}`;
    document.getElementById('gamesList').innerHTML = '';

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
        output += '<tr><th>Edit</th><th>AppID</th><th>Title</th><th>Genre</th><th>Developers</th></tr>';

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