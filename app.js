// TODO - when no Team input is selected, recent games should show
// 10 most recent games in the league

// DOM Selectors
const apiCard = document.querySelector('#apiCard')
const form = document.querySelector('form')
const playerInput = document.querySelector('#playerInput')
const teamsDropdown = document.querySelector('#nbaTeams')
const gamesDropdown = document.querySelector('#recentGames')
const qSubmitBtn = document.querySelector('#qBtn')
const qDiv = document.querySelector('#showcase')
const qDivHeading = document.createElement('h3')

// should run onload to fill dropdown menu
window.onload = () => {
  getAllTeams()
  gamesDropdown.disabled = true
}

// EVENT Listeners
qSubmitBtn.addEventListener('click', (e) => {
  e.preventDefault()

  if (playerInput.value) {
    const playerName = playerInput.value
    try {
      getPlayerInfo(playerName)

    } catch (error) {
      console.log(error)
    }

    playerInput.value = ""
  }
  else {
    const gameId = gamesDropdown.value
    getTopPerformers(gameId)
  }
})

playerInput.addEventListener('focus', () => {
  teamsDropdown.disabled = true
  gamesDropdown.disabled = true
})

playerInput.addEventListener('blur', function () {
  if (!this.value) {
    teamsDropdown.disabled = false
    gamesDropdown.disabled = false
  }
})

// TODO - accomodate to when no team is selected and league recent games is shown
// BUG - once user selects a team, cannot change mind to query a player instead
teamsDropdown.addEventListener('input', function () {
  playerInput.disabled = true

  const teamId = this.value
  if (teamId > 0) gamesDropdown.disabled = false
  getRecentGames(teamId)
})

// FUNCTIONS
function showPlayerStats(data) {
  const { season, pts, ast, reb, blk, stl, min } = data
  const categories = ['points', 'assists', 'rebounds', 'blocks', 'steals', 'minutes']
  const stats = [pts, ast, reb, blk, stl, min]

  // playerStats written on DOM
  const statsDiv = document.createElement('div')
  const statsH4 = document.createElement('h4')


  statsH4.textContent = `${season} Season Average`
  statsDiv.append(statsH4)
  for (let i = 0; i < categories.length; i++) {
    const statUl = document.createElement('ul')
    const statLi = document.createElement('li')
    statLi.textContent = `${stats[i]} ${categories[i].capitalize()}`
    statsDiv.append(statLi)
  }

  qDiv.append(statsDiv)
}

function showPlayerInfo(data) {
  const playerId = data.id
  const playerFullName = `${data.first_name} ${data.last_name}`
  // destructures and assigns the full name of the player's team to the var
  const { full_name: playerTeam } = data.team
  console.log({ playerId, playerFullName, playerTeam })

  // playerInfo written on DOM
  const playerDiv = document.createElement('div')
  const playerH3 = document.createElement('h3')
  const playerP = document.createElement('p')

  playerH3.textContent = playerFullName
  playerP.textContent = playerTeam
  playerDiv.append(playerH3, playerP)

  clearqDiv()
  qDiv.append(playerDiv)

  getPlayerStats(playerId)
}

function showMultiplePlayers(arrOfPlayers) {
  const playersDropdown = document.createElement('select')
  const defaultOptn = document.createElement('option')
  defaultOptn.textContent = "Select Matching Player"
  defaultOptn.selected = true
  defaultOptn.disabled = true
  playersDropdown.append(defaultOptn)

  for (let player of arrOfPlayers.reverse()) {
    const optn = document.createElement('option')
    optn.textContent = `${player.first_name} ${player.last_name}`
    playersDropdown.append(optn)
  }
  form.append(playersDropdown)
  return playersDropdown
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

function showRecentGames(arr) {

  // sorts the game in descending order to show most recent first
  arr.sort(function (a, b) {
    const aDate = a.date.slice(0, 10)
    const bDate = b.date.slice(0, 10)
    let aa = aDate.split('-').join(),
      bb = bDate.split('-').join();
    return aa < bb ? 1 : (aa > bb ? -1 : 0);
  });

  gamesDropdown.innerHTML = ""
  for (let game of arr) {
    // only grabs YYYY-MM-DD from the date string
    const gameId = game.id
    const gameDate = game.date.slice(0, 10)
    const homeTeam = game.home_team.full_name
    const homeScore = game.home_team_score
    const awayTeam = game.visitor_team.full_name
    const awayScore = game.visitor_team_score

    const dropdownString = `${gameDate} ${awayTeam} @ ${homeTeam} ${awayScore} - ${homeScore}`

    // Add to DOM as a dropdown menu with values and id as the gameId
    const optn = document.createElement('option')
    optn.textContent = dropdownString
    optn.value = gameId
    gamesDropdown.append(optn)
  }
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

function showTopPerformers(team) {
  const topPerformers = {}
  const topPoints = team.reduce((top, player) => player.pts > top.pts ? player : top, team[0])
  const topAssists = team.reduce((top, player) => player.ast > top.ast ? player : top, team[0])
  const topRebounds = team.reduce((top, player) => player.reb > top.reb ? player : top, team[0])
  const topBlocks = team.reduce((top, player) => player.blk > top.blk ? player : top, team[0])
  const topSteals = team.reduce((top, player) => player.stl > top.stl ? player : top, team[0])

  //Show to DOM on the space provided
  const div = document.createElement('div')
  const teamH3 = document.createElement('h3')

  teamH3.textContent = topPoints.team.full_name
  div.append(teamH3)
  writeCategory(div, topPoints, "points", 'pts')
  writeCategory(div, topAssists, "assists", 'ast')
  writeCategory(div, topRebounds, "rebounds", 'reb')
  writeCategory(div, topBlocks, "blocks", 'blk')
  writeCategory(div, topSteals, "steals", 'stl')

  qDiv.append(div)
}

// EDIT - to be edited for better designs
function writeCategory(cont, player, cat, attr) {
  const ul = document.createElement('ul')
  const li = document.createElement('li')
  ul.textContent = cat.capitalize()
  const { first_name, last_name } = player.player
  li.textContent = `${first_name} ${last_name} - ${player[attr]} ${cat}`
  cont.append(ul, li)
}

function clearqDiv() {
  qDiv.innerHTML = ""
}

function errorMessage(msg) {
  qDivHeading.textContent = msg
  qDiv.append(qDivHeading)
}

// ASYNC FUNCTIONS - PROMISE
// queries a certain player according to id and prints their stats accordingly
async function getPlayerStats(id) {
  // query can accept another parameter for season. defaults to current season as below.
  try {
    const response = await axios.get(`https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${id}`)
    // stores an object that has the player's average on the given season
    const [playerStats] = response.data.data

    showPlayerStats(playerStats)
    // const stats = { statAssists, statBlocks, statMinutes, statPoints, statRebounds, statSeason, statSteals }
    // TODO - playerStats written on DOM
  } catch (error) {
    console.log(error)
    errorMessage("Unavailable Stats for Selected Player")
  }

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
        // disableEls([playerInput, teamsDropdown])
        playerInput.disabled = true
        teamsDropdown.disabled = true
        const matchingPlayersDropdown = showMultiplePlayers(player)
        matchingPlayersDropdown.addEventListener('change', function () {
          const chosenPlayer = this.value
          getPlayerInfo(chosenPlayer)
        })
        // FUTURE - can be refactored to save one API call by using showPlayerInfo() and adding the id and team name with the playerName
        // getPlayerInfo(matchingNames[0])
      }
      // only one record
      else {

        // destructures the array and assigns to variable
        const [playerData] = player
        showPlayerInfo(playerData)
      }
    })
    .catch((err) => {
      console.log(err)
      errorMessage("Unavailable Info for Player Wanted")
    })
}

async function getAllTeams() {
  try {
    const response = await axios.get("https://www.balldontlie.io/api/v1/teams")
    // unpacks response Array data to variable teams
    const { data: { data: teams } } = response
    showAllTeams(teams)
  } catch (error) {
    console.log(error)
    errorMessage("Unavailable Info to show All NBA Teams")
  }

}

// id would come from user input from team dropdown menu
async function getRecentGames(id) {
  try {
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

  } catch (error) {
    console.log(error)
    errorMessage("Unavailable Games for the Selected Team")
  }

}

// id would come from user input from recent games dropdown menu
async function getTopPerformers(id) {
  try {
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
    clearqDiv()
    showTopPerformers(homeTeamPlayers)
    showTopPerformers(awayTeamPlayers)
  } catch (error) {
    console.log(error)
    errorMessage("Unavailable Information for the Selected Game")
  }

}

// PROTO EXTENSIONS
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

