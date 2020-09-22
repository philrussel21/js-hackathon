// TODO - when no Team input is selected, recent games should show
// 10 most recent games in the league

// DOM Selectors
const apiCard = document.querySelector('#apiCard')
const form = document.querySelector('form')
const teamsDropdown = document.querySelector('#nbaTeams')
const gamesDropdown = document.querySelector('#recentGames')
const qSubmitBtn = document.querySelector('#qBtn')


// should run onload to fill dropdown menu
window.onload = () => {
  getAllTeams()
}

// id would come from user input from dropdown menu
getRecentGames(2)

// id would come from user input from recent games dropdown menu
getTopPerformers(123540)


// name goes here: would be coming from the player input
const playerInput = 'andre'


// MAIN FLOW OF THE PROGRAM - to be changed when DOM is set up
getPlayerInfo(playerInput)

// queries a certain player according to id and prints their stats accordingly
// TODO - stats to print in DOM
async function showPlayerStats(id) {
  // query can accept another parameter for season. defaults to current season as below.
  try {
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
    // TODO - playerStats written on DOM
  } catch (error) {
    console.log('Unavailable Data for selected player')
  }

}

function showPlayerInfo(data) {
  const playerId = data.id
  const playerFullName = `${data.first_name} ${data.last_name}`
  // destructures and assigns the full name of the player's team to the var
  const { full_name: playerTeam } = data.team
  console.log({ playerId, playerFullName, playerTeam })
  // TODO - playerInfo written on DOM

  showPlayerStats(playerId)
}

function getPlayerInfo(input) {
  const playerName = input.trim().split(' ')
  // conditional assignment to variable.
  const playerQuery = (playerName.length === 1) ? playerName[0] : `${playerName[0]}+${playerName[1]}`
  axios.get(`https://www.balldontlie.io/api/v1/players?per_page=50&search=${playerQuery}`)
    .then(({ data }) => {
      const { data: player } = data
      // if results has more than one record, create a dynamic dropdown menu consisting all of the records to
      // further filter the results
      if (player.length > 1) {
        console.log(data)
        const matchingNames = []

        for (let rec of player) {
          const playerFullName = `${rec.first_name} ${rec.last_name}`
          matchingNames.push(playerFullName)
        }
        console.log(matchingNames)
        // TODO - matchingNames to be shown to user as dropdown menu, then the selected playerName
        // would be passed as the argument in the function below.
        // FUTURE - can be refactored to save one API call by using showPlayerInfo() and adding the id and team name with the playerName
        // getPlayerInfo(matchingNames[0])

      }
      // only one record
      else {
        // logs an array of player data
        console.log('only one player')

        // destructures the array and assigns to variable
        const [playerData] = player
        showPlayerInfo(playerData)
      }
    }).catch((err) => {
      console.log(err)
    });
}

async function getAllTeams() {
  const response = await axios.get("https://www.balldontlie.io/api/v1/teams")
  // unpacks response Array data to variable teams
  const { data: { data: teams } } = response
  showAllTeams(teams)
}

function showAllTeams(arr) {

  for (let team of arr) {
    // Add to DOM as a dropdown menu with value as the name and id as the teamid
    const { full_name, id } = team

    const optn = document.createElement('option')
    optn.textContent = full_name
    optn.value = id
    teamsDropdown.append(optn)
  }

}

// id would come from user input from team dropdown menu
async function getRecentGames(id) {
  // FUTURE - can also be dynamic
  const season = 2019
  // grabs today's date object then converts to specified format to be used for query
  const userDate = setUserDate()
  const response = await axios.get(`https://www.balldontlie.io/api/v1/games?seasons[]=${season}&team_ids[]=${id}&per_page=100&end_date=${userDate}`)
  // unpacks response Array data to variable seasonGames
  const { data: { data: seasonGames } } = response
  // extracts the last 10 recent games of the selected team
  const teamRecentGames = seasonGames.slice(-10).reverse()
  showRecentGames(teamRecentGames)

}

function showRecentGames(arr) {
  const games = []

  // sorts the game in descending order to show most recent first
  arr.sort(function (a, b) {
    const aDate = a.date.slice(0, 10)
    const bDate = b.date.slice(0, 10)
    let aa = aDate.split('-').join(),
      bb = bDate.split('-').join();
    return aa < bb ? 1 : (aa > bb ? -1 : 0);
  });

  for (let game of arr) {
    // only grabs YYYY-MM-DD from the date string
    const gameId = game.id
    const gameDate = game.date.slice(0, 10)
    const homeTeam = game.home_team.full_name
    const homeScore = game.home_team_score
    const awayTeam = game.visitor_team.full_name
    const awayScore = game.visitor_team_score

    const dropdownString = `${gameDate} ${awayTeam} @ ${homeTeam} ${awayScore} - ${homeScore}`
    games.push({ gameId, dropdownString })
  }
  console.log(games)
  // TODO - Add to DOM as a dropdown menu with values and id as the gameId
}

function setUserDate() {
  let d = new Date(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

// id would come from user input from recent games dropdown menu
async function getTopPerformers(id) {
  const teamsRequest = axios.get(`https://www.balldontlie.io/api/v1/games/${id}`)
  const statsRequest = axios.get(`https://www.balldontlie.io/api/v1/stats?game_ids[]=${id}&per_page=50`)
  const response = await Promise.all([teamsRequest, statsRequest])
  const [teamsResponse, statsResponse] = response

  const homeTeamId = teamsResponse.data.home_team.id

  // unpacks statsResponse Array data to variable gameStats
  const { data: { data: gameStats } } = statsResponse

  // assigns players to associated teams
  const homeTeamPlayers = []
  const awayTeamPlayers = []
  for (let player of gameStats) {
    player.team.id === homeTeamId ? homeTeamPlayers.push(player) : awayTeamPlayers.push(player)
  }

  showTopPerformers(homeTeamPlayers)
  showTopPerformers(awayTeamPlayers)
}

function showTopPerformers(team) {
  const topPerformers = {}
  const topPoints = team.reduce((top, player) => player.pts > top.pts ? player : top, team[0])
  const topAssists = team.reduce((top, player) => player.ast > top.ast ? player : top, team[0])
  const topRebounds = team.reduce((top, player) => player.reb > top.reb ? player : top, team[0])
  const topBlocks = team.reduce((top, player) => player.blk > top.blk ? player : top, team[0])
  const topStealss = team.reduce((top, player) => player.stl > top.stl ? player : top, team[0])
  console.log({ topPoints, topAssists, topRebounds, topBlocks, topStealss })
  // TODO - Show to DOM on the space provided
}
