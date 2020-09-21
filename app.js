
// should run onload to fill dropdown menu
getAllTeams()

// id would come from user input from dropdown menu
getRecentGames(2)

async function getAllTeams() {
  const response = await axios.get("https://www.balldontlie.io/api/v1/teams")
  // unpacks response Array data to variable teams
  const { data: { data: teams } } = response
  showAllTeams(teams)
}

function showAllTeams(arr) {
  const teams = []
  for (let team of arr) {
    const { full_name, id } = team
    teams.push({ full_name, id })
  }
  console.log(teams)
  // TODO - Add to DOM as a dropdown menu with value as the name and id as the teamid
}

// id would come from user input from dropdown menu
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

async function getGameStats() {

}