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

        // let output = '<ul>';
        // games.forEach(game => {
        //     // Ensure 'Name' and 'Genres' match the properties from your database
        //     output += `<li>${game.Name} - ${game.Genres}</li>`;
        // });
        // output += '</ul>';

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
        // document.getElementById('gamesList').innerHTML = output;
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




