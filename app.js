
// name goes here: would be coming from the player input
const playerFirstName = 'lebron'
const playerLastName = 'james'
axios.get(`https://www.balldontlie.io/api/v1/players?search=${playerFirstName}+${playerLastName}`)
  .then(({ data }) => {
    const { data: player } = data
    // if results has more than one record, create a dynamic dropdown menu consisting all of the records to
    // further filter the results
    if (player.length > 1) {
      console.log('more than one player')
    }
    // only one record
    else {
      // logs an array of player data
      console.log('only one player')

      // destructures the array and assigns to variable
      const [playerData] = player
      const playerId = playerData.id
      const playerName = `${playerData.first_name} ${playerData.last_name}`
      // destructures and assigns the full name of the player's team to the var
      const { full_name: playerTeam } = playerData.team
      console.log({ playerId, playerName, playerTeam })
      showPlayerStats(playerId)
    }
  }).catch((err) => {
    console.log(err)
  });

// queries a certain player according to id and prints their stats accordingly
// TODO - stats to print in DOM
async function showPlayerStats(id) {
  // query can accept another parameter for season. defaults to current season as below.
  const response = await axios.get(`https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${id}`)
  // stores an object that has the player's average on the given season
  const [playerStats] = response.data.data

  // can also use destructuring but for readability decided to use declaration instead
  const statSeason = playerStats.season
  const statPoints = playerStats.pts
  const statAssists = playerStats.ast
  const statRebounds = playerStats.reb
  const statBlocks = playerStats.blk
  const statSteals = playerStats.stl
  const statMinutes = playerStats.min
  console.log({ statAssists, statBlocks, statMinutes, statPoints, statRebounds, statSeason, statSteals })
}