import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'developers-pandascore/2.62.0 (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Get the latest additions.
   *
   * This endpoint only shows unchanged objects.
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List additions
   * @throws FetchError<400, types.GetAdditionsResponse400> Bad request
   * @throws FetchError<401, types.GetAdditionsResponse401> Unauthorized
   * @throws FetchError<403, types.GetAdditionsResponse403> Forbidden
   * @throws FetchError<404, types.GetAdditionsResponse404> Not found
   * @throws FetchError<422, types.GetAdditionsResponse422> Unprocessable Entity
   */
  get_additions(metadata?: types.GetAdditionsMetadataParam): Promise<FetchResponse<200, types.GetAdditionsResponse200>> {
    return this.core.fetch('/additions', 'get', metadata);
  }

  /**
   * Get the latest updates.
   *
   * This endpoint only provides the latest change for an object. It does not keep track of
   * previous changes.
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List changes
   * @throws FetchError<400, types.GetChangesResponse400> Bad request
   * @throws FetchError<401, types.GetChangesResponse401> Unauthorized
   * @throws FetchError<403, types.GetChangesResponse403> Forbidden
   * @throws FetchError<404, types.GetChangesResponse404> Not found
   * @throws FetchError<422, types.GetChangesResponse422> Unprocessable Entity
   */
  get_changes(metadata?: types.GetChangesMetadataParam): Promise<FetchResponse<200, types.GetChangesResponse200>> {
    return this.core.fetch('/changes', 'get', metadata);
  }

  /**
   * Get the latest deleted documents
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List deletions
   * @throws FetchError<400, types.GetDeletionsResponse400> Bad request
   * @throws FetchError<401, types.GetDeletionsResponse401> Unauthorized
   * @throws FetchError<403, types.GetDeletionsResponse403> Forbidden
   * @throws FetchError<404, types.GetDeletionsResponse404> Not found
   * @throws FetchError<422, types.GetDeletionsResponse422> Unprocessable Entity
   */
  get_deletions(metadata?: types.GetDeletionsMetadataParam): Promise<FetchResponse<200, types.GetDeletionsResponse200>> {
    return this.core.fetch('/deletions', 'get', metadata);
  }

  /**
   * Get the latest updates and additions.
   *
   * This endpoint only provides the latest incident for an object. It does not keep track of
   * previous incidents.
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List changes, additions and deletions
   * @throws FetchError<400, types.GetIncidentsResponse400> Bad request
   * @throws FetchError<401, types.GetIncidentsResponse401> Unauthorized
   * @throws FetchError<403, types.GetIncidentsResponse403> Forbidden
   * @throws FetchError<404, types.GetIncidentsResponse404> Not found
   * @throws FetchError<422, types.GetIncidentsResponse422> Unprocessable Entity
   */
  get_incidents(metadata?: types.GetIncidentsMetadataParam): Promise<FetchResponse<200, types.GetIncidentsResponse200>> {
    return this.core.fetch('/incidents', 'get', metadata);
  }

  /**
   * List leagues
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List leagues
   * @throws FetchError<400, types.GetLeaguesResponse400> Bad request
   * @throws FetchError<401, types.GetLeaguesResponse401> Unauthorized
   * @throws FetchError<403, types.GetLeaguesResponse403> Forbidden
   * @throws FetchError<404, types.GetLeaguesResponse404> Not found
   * @throws FetchError<422, types.GetLeaguesResponse422> Unprocessable Entity
   */
  get_leagues(metadata?: types.GetLeaguesMetadataParam): Promise<FetchResponse<200, types.GetLeaguesResponse200>> {
    return this.core.fetch('/leagues', 'get', metadata);
  }

  /**
   * Get a single league by ID or by slug
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get a league
   * @throws FetchError<400, types.GetLeaguesLeagueIdOrSlugResponse400> Bad request
   * @throws FetchError<401, types.GetLeaguesLeagueIdOrSlugResponse401> Unauthorized
   * @throws FetchError<403, types.GetLeaguesLeagueIdOrSlugResponse403> Forbidden
   * @throws FetchError<404, types.GetLeaguesLeagueIdOrSlugResponse404> Not found
   * @throws FetchError<422, types.GetLeaguesLeagueIdOrSlugResponse422> Unprocessable Entity
   */
  get_leagues_leagueIdOrSlug(metadata: types.GetLeaguesLeagueIdOrSlugMetadataParam): Promise<FetchResponse<200, types.GetLeaguesLeagueIdOrSlugResponse200>> {
    return this.core.fetch('/leagues/{league_id_or_slug}', 'get', metadata);
  }

  /**
   * List matches of the given league
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get matches for a league
   * @throws FetchError<400, types.GetLeaguesLeagueIdOrSlugMatchesResponse400> Bad request
   * @throws FetchError<401, types.GetLeaguesLeagueIdOrSlugMatchesResponse401> Unauthorized
   * @throws FetchError<403, types.GetLeaguesLeagueIdOrSlugMatchesResponse403> Forbidden
   * @throws FetchError<404, types.GetLeaguesLeagueIdOrSlugMatchesResponse404> Not found
   * @throws FetchError<422, types.GetLeaguesLeagueIdOrSlugMatchesResponse422> Unprocessable Entity
   */
  get_leagues_leagueIdOrSlug_matches(metadata: types.GetLeaguesLeagueIdOrSlugMatchesMetadataParam): Promise<FetchResponse<200, types.GetLeaguesLeagueIdOrSlugMatchesResponse200>> {
    return this.core.fetch('/leagues/{league_id_or_slug}/matches', 'get', metadata);
  }

  /**
   * List past matches for the given league
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get past matches for league
   * @throws FetchError<400, types.GetLeaguesLeagueIdOrSlugMatchesPastResponse400> Bad request
   * @throws FetchError<401, types.GetLeaguesLeagueIdOrSlugMatchesPastResponse401> Unauthorized
   * @throws FetchError<403, types.GetLeaguesLeagueIdOrSlugMatchesPastResponse403> Forbidden
   * @throws FetchError<404, types.GetLeaguesLeagueIdOrSlugMatchesPastResponse404> Not found
   * @throws FetchError<422, types.GetLeaguesLeagueIdOrSlugMatchesPastResponse422> Unprocessable Entity
   */
  get_leagues_leagueIdOrSlug_matches_past(metadata: types.GetLeaguesLeagueIdOrSlugMatchesPastMetadataParam): Promise<FetchResponse<200, types.GetLeaguesLeagueIdOrSlugMatchesPastResponse200>> {
    return this.core.fetch('/leagues/{league_id_or_slug}/matches/past', 'get', metadata);
  }

  /**
   * List currently running matches for the given league
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get running matches for league
   * @throws FetchError<400, types.GetLeaguesLeagueIdOrSlugMatchesRunningResponse400> Bad request
   * @throws FetchError<401, types.GetLeaguesLeagueIdOrSlugMatchesRunningResponse401> Unauthorized
   * @throws FetchError<403, types.GetLeaguesLeagueIdOrSlugMatchesRunningResponse403> Forbidden
   * @throws FetchError<404, types.GetLeaguesLeagueIdOrSlugMatchesRunningResponse404> Not found
   * @throws FetchError<422, types.GetLeaguesLeagueIdOrSlugMatchesRunningResponse422> Unprocessable Entity
   */
  get_leagues_leagueIdOrSlug_matches_running(metadata: types.GetLeaguesLeagueIdOrSlugMatchesRunningMetadataParam): Promise<FetchResponse<200, types.GetLeaguesLeagueIdOrSlugMatchesRunningResponse200>> {
    return this.core.fetch('/leagues/{league_id_or_slug}/matches/running', 'get', metadata);
  }

  /**
   * List upcoming matches for the given league
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get upcoming matches for league
   * @throws FetchError<400, types.GetLeaguesLeagueIdOrSlugMatchesUpcomingResponse400> Bad request
   * @throws FetchError<401, types.GetLeaguesLeagueIdOrSlugMatchesUpcomingResponse401> Unauthorized
   * @throws FetchError<403, types.GetLeaguesLeagueIdOrSlugMatchesUpcomingResponse403> Forbidden
   * @throws FetchError<404, types.GetLeaguesLeagueIdOrSlugMatchesUpcomingResponse404> Not found
   * @throws FetchError<422, types.GetLeaguesLeagueIdOrSlugMatchesUpcomingResponse422> Unprocessable Entity
   */
  get_leagues_leagueIdOrSlug_matches_upcoming(metadata: types.GetLeaguesLeagueIdOrSlugMatchesUpcomingMetadataParam): Promise<FetchResponse<200, types.GetLeaguesLeagueIdOrSlugMatchesUpcomingResponse200>> {
    return this.core.fetch('/leagues/{league_id_or_slug}/matches/upcoming', 'get', metadata);
  }

  /**
   * List series for the given league
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List series of a league
   * @throws FetchError<400, types.GetLeaguesLeagueIdOrSlugSeriesResponse400> Bad request
   * @throws FetchError<401, types.GetLeaguesLeagueIdOrSlugSeriesResponse401> Unauthorized
   * @throws FetchError<403, types.GetLeaguesLeagueIdOrSlugSeriesResponse403> Forbidden
   * @throws FetchError<404, types.GetLeaguesLeagueIdOrSlugSeriesResponse404> Not found
   * @throws FetchError<422, types.GetLeaguesLeagueIdOrSlugSeriesResponse422> Unprocessable Entity
   */
  get_leagues_leagueIdOrSlug_series(metadata: types.GetLeaguesLeagueIdOrSlugSeriesMetadataParam): Promise<FetchResponse<200, types.GetLeaguesLeagueIdOrSlugSeriesResponse200>> {
    return this.core.fetch('/leagues/{league_id_or_slug}/series', 'get', metadata);
  }

  /**
   * List tournaments of the given league
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get tournaments for a league
   * @throws FetchError<400, types.GetLeaguesLeagueIdOrSlugTournamentsResponse400> Bad request
   * @throws FetchError<401, types.GetLeaguesLeagueIdOrSlugTournamentsResponse401> Unauthorized
   * @throws FetchError<403, types.GetLeaguesLeagueIdOrSlugTournamentsResponse403> Forbidden
   * @throws FetchError<404, types.GetLeaguesLeagueIdOrSlugTournamentsResponse404> Not found
   * @throws FetchError<422, types.GetLeaguesLeagueIdOrSlugTournamentsResponse422> Unprocessable Entity
   */
  get_leagues_leagueIdOrSlug_tournaments(metadata: types.GetLeaguesLeagueIdOrSlugTournamentsMetadataParam): Promise<FetchResponse<200, types.GetLeaguesLeagueIdOrSlugTournamentsResponse200>> {
    return this.core.fetch('/leagues/{league_id_or_slug}/tournaments', 'get', metadata);
  }

  /**
   * List currently running live matches, available from pandascore with live websocket data.
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List lives matches
   * @throws FetchError<400, types.GetLivesResponse400> Bad request
   * @throws FetchError<401, types.GetLivesResponse401> Unauthorized
   * @throws FetchError<403, types.GetLivesResponse403> Forbidden
   * @throws FetchError<404, types.GetLivesResponse404> Not found
   * @throws FetchError<422, types.GetLivesResponse422> Unprocessable Entity
   */
  get_lives(metadata?: types.GetLivesMetadataParam): Promise<FetchResponse<200, types.GetLivesResponse200>> {
    return this.core.fetch('/lives', 'get', metadata);
  }

  /**
   * List matches
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List matches
   * @throws FetchError<400, types.GetMatchesResponse400> Bad request
   * @throws FetchError<401, types.GetMatchesResponse401> Unauthorized
   * @throws FetchError<403, types.GetMatchesResponse403> Forbidden
   * @throws FetchError<404, types.GetMatchesResponse404> Not found
   * @throws FetchError<422, types.GetMatchesResponse422> Unprocessable Entity
   */
  get_matches(metadata?: types.GetMatchesMetadataParam): Promise<FetchResponse<200, types.GetMatchesResponse200>> {
    return this.core.fetch('/matches', 'get', metadata);
  }

  /**
   * List past matches
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get past matches
   * @throws FetchError<400, types.GetMatchesPastResponse400> Bad request
   * @throws FetchError<401, types.GetMatchesPastResponse401> Unauthorized
   * @throws FetchError<403, types.GetMatchesPastResponse403> Forbidden
   * @throws FetchError<404, types.GetMatchesPastResponse404> Not found
   * @throws FetchError<422, types.GetMatchesPastResponse422> Unprocessable Entity
   */
  get_matches_past(metadata?: types.GetMatchesPastMetadataParam): Promise<FetchResponse<200, types.GetMatchesPastResponse200>> {
    return this.core.fetch('/matches/past', 'get', metadata);
  }

  /**
   * List currently running matches
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get running matches
   * @throws FetchError<400, types.GetMatchesRunningResponse400> Bad request
   * @throws FetchError<401, types.GetMatchesRunningResponse401> Unauthorized
   * @throws FetchError<403, types.GetMatchesRunningResponse403> Forbidden
   * @throws FetchError<404, types.GetMatchesRunningResponse404> Not found
   * @throws FetchError<422, types.GetMatchesRunningResponse422> Unprocessable Entity
   */
  get_matches_running(metadata?: types.GetMatchesRunningMetadataParam): Promise<FetchResponse<200, types.GetMatchesRunningResponse200>> {
    return this.core.fetch('/matches/running', 'get', metadata);
  }

  /**
   * List upcoming matches
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get upcoming matches
   * @throws FetchError<400, types.GetMatchesUpcomingResponse400> Bad request
   * @throws FetchError<401, types.GetMatchesUpcomingResponse401> Unauthorized
   * @throws FetchError<403, types.GetMatchesUpcomingResponse403> Forbidden
   * @throws FetchError<404, types.GetMatchesUpcomingResponse404> Not found
   * @throws FetchError<422, types.GetMatchesUpcomingResponse422> Unprocessable Entity
   */
  get_matches_upcoming(metadata?: types.GetMatchesUpcomingMetadataParam): Promise<FetchResponse<200, types.GetMatchesUpcomingResponse200>> {
    return this.core.fetch('/matches/upcoming', 'get', metadata);
  }

  /**
   * Get a single match by ID or by slug
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get a match
   * @throws FetchError<400, types.GetMatchesMatchIdOrSlugResponse400> Bad request
   * @throws FetchError<401, types.GetMatchesMatchIdOrSlugResponse401> Unauthorized
   * @throws FetchError<403, types.GetMatchesMatchIdOrSlugResponse403> Forbidden
   * @throws FetchError<404, types.GetMatchesMatchIdOrSlugResponse404> Not found
   * @throws FetchError<422, types.GetMatchesMatchIdOrSlugResponse422> Unprocessable Entity
   */
  get_matches_matchIdOrSlug(metadata: types.GetMatchesMatchIdOrSlugMetadataParam): Promise<FetchResponse<200, types.GetMatchesMatchIdOrSlugResponse200>> {
    return this.core.fetch('/matches/{match_id_or_slug}', 'get', metadata);
  }

  /**
   * List opponents (player or teams) for the given match
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get match's opponents
   * @throws FetchError<400, types.GetMatchesMatchIdOrSlugOpponentsResponse400> Bad request
   * @throws FetchError<401, types.GetMatchesMatchIdOrSlugOpponentsResponse401> Unauthorized
   * @throws FetchError<403, types.GetMatchesMatchIdOrSlugOpponentsResponse403> Forbidden
   * @throws FetchError<404, types.GetMatchesMatchIdOrSlugOpponentsResponse404> Not found
   * @throws FetchError<422, types.GetMatchesMatchIdOrSlugOpponentsResponse422> Unprocessable Entity
   */
  get_matches_matchIdOrSlug_opponents(metadata: types.GetMatchesMatchIdOrSlugOpponentsMetadataParam): Promise<FetchResponse<200, types.GetMatchesMatchIdOrSlugOpponentsResponse200>> {
    return this.core.fetch('/matches/{match_id_or_slug}/opponents', 'get', metadata);
  }

  /**
   * List players
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List players
   * @throws FetchError<400, types.GetPlayersResponse400> Bad request
   * @throws FetchError<401, types.GetPlayersResponse401> Unauthorized
   * @throws FetchError<403, types.GetPlayersResponse403> Forbidden
   * @throws FetchError<404, types.GetPlayersResponse404> Not found
   * @throws FetchError<422, types.GetPlayersResponse422> Unprocessable Entity
   */
  get_players(metadata?: types.GetPlayersMetadataParam): Promise<FetchResponse<200, types.GetPlayersResponse200>> {
    return this.core.fetch('/players', 'get', metadata);
  }

  /**
   * Get a single player by ID or by slug
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get a player
   * @throws FetchError<400, types.GetPlayersPlayerIdOrSlugResponse400> Bad request
   * @throws FetchError<401, types.GetPlayersPlayerIdOrSlugResponse401> Unauthorized
   * @throws FetchError<403, types.GetPlayersPlayerIdOrSlugResponse403> Forbidden
   * @throws FetchError<404, types.GetPlayersPlayerIdOrSlugResponse404> Not found
   * @throws FetchError<422, types.GetPlayersPlayerIdOrSlugResponse422> Unprocessable Entity
   */
  get_players_playerIdOrSlug(metadata: types.GetPlayersPlayerIdOrSlugMetadataParam): Promise<FetchResponse<200, types.GetPlayersPlayerIdOrSlugResponse200>> {
    return this.core.fetch('/players/{player_id_or_slug}', 'get', metadata);
  }

  /**
   * List leagues for the given player. Only leagues from the player's current videogame.
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get leagues for a player
   * @throws FetchError<400, types.GetPlayersPlayerIdOrSlugLeaguesResponse400> Bad request
   * @throws FetchError<401, types.GetPlayersPlayerIdOrSlugLeaguesResponse401> Unauthorized
   * @throws FetchError<403, types.GetPlayersPlayerIdOrSlugLeaguesResponse403> Forbidden
   * @throws FetchError<404, types.GetPlayersPlayerIdOrSlugLeaguesResponse404> Not found
   * @throws FetchError<422, types.GetPlayersPlayerIdOrSlugLeaguesResponse422> Unprocessable Entity
   */
  get_players_playerIdOrSlug_leagues(metadata: types.GetPlayersPlayerIdOrSlugLeaguesMetadataParam): Promise<FetchResponse<200, types.GetPlayersPlayerIdOrSlugLeaguesResponse200>> {
    return this.core.fetch('/players/{player_id_or_slug}/leagues', 'get', metadata);
  }

  /**
   * List matches for the given player. Only matches from the player's current videogame.
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get matches for a player
   * @throws FetchError<400, types.GetPlayersPlayerIdOrSlugMatchesResponse400> Bad request
   * @throws FetchError<401, types.GetPlayersPlayerIdOrSlugMatchesResponse401> Unauthorized
   * @throws FetchError<403, types.GetPlayersPlayerIdOrSlugMatchesResponse403> Forbidden
   * @throws FetchError<404, types.GetPlayersPlayerIdOrSlugMatchesResponse404> Not found
   * @throws FetchError<422, types.GetPlayersPlayerIdOrSlugMatchesResponse422> Unprocessable Entity
   */
  get_players_playerIdOrSlug_matches(metadata: types.GetPlayersPlayerIdOrSlugMatchesMetadataParam): Promise<FetchResponse<200, types.GetPlayersPlayerIdOrSlugMatchesResponse200>> {
    return this.core.fetch('/players/{player_id_or_slug}/matches', 'get', metadata);
  }

  /**
   * List series for the given player. Only series from the player's current videogame.
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get series for a player
   * @throws FetchError<400, types.GetPlayersPlayerIdOrSlugSeriesResponse400> Bad request
   * @throws FetchError<401, types.GetPlayersPlayerIdOrSlugSeriesResponse401> Unauthorized
   * @throws FetchError<403, types.GetPlayersPlayerIdOrSlugSeriesResponse403> Forbidden
   * @throws FetchError<404, types.GetPlayersPlayerIdOrSlugSeriesResponse404> Not found
   * @throws FetchError<422, types.GetPlayersPlayerIdOrSlugSeriesResponse422> Unprocessable Entity
   */
  get_players_playerIdOrSlug_series(metadata: types.GetPlayersPlayerIdOrSlugSeriesMetadataParam): Promise<FetchResponse<200, types.GetPlayersPlayerIdOrSlugSeriesResponse200>> {
    return this.core.fetch('/players/{player_id_or_slug}/series', 'get', metadata);
  }

  /**
   * List tournaments for the given player. Only tournaments from the player's current
   * videogame.
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get tournaments for a player
   * @throws FetchError<400, types.GetPlayersPlayerIdOrSlugTournamentsResponse400> Bad request
   * @throws FetchError<401, types.GetPlayersPlayerIdOrSlugTournamentsResponse401> Unauthorized
   * @throws FetchError<403, types.GetPlayersPlayerIdOrSlugTournamentsResponse403> Forbidden
   * @throws FetchError<404, types.GetPlayersPlayerIdOrSlugTournamentsResponse404> Not found
   * @throws FetchError<422, types.GetPlayersPlayerIdOrSlugTournamentsResponse422> Unprocessable Entity
   */
  get_players_playerIdOrSlug_tournaments(metadata: types.GetPlayersPlayerIdOrSlugTournamentsMetadataParam): Promise<FetchResponse<200, types.GetPlayersPlayerIdOrSlugTournamentsResponse200>> {
    return this.core.fetch('/players/{player_id_or_slug}/tournaments', 'get', metadata);
  }

  /**
   * List series
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List series
   * @throws FetchError<400, types.GetSeriesResponse400> Bad request
   * @throws FetchError<401, types.GetSeriesResponse401> Unauthorized
   * @throws FetchError<403, types.GetSeriesResponse403> Forbidden
   * @throws FetchError<404, types.GetSeriesResponse404> Not found
   * @throws FetchError<422, types.GetSeriesResponse422> Unprocessable Entity
   */
  get_series(metadata?: types.GetSeriesMetadataParam): Promise<FetchResponse<200, types.GetSeriesResponse200>> {
    return this.core.fetch('/series', 'get', metadata);
  }

  /**
   * List past series
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get past series
   * @throws FetchError<400, types.GetSeriesPastResponse400> Bad request
   * @throws FetchError<401, types.GetSeriesPastResponse401> Unauthorized
   * @throws FetchError<403, types.GetSeriesPastResponse403> Forbidden
   * @throws FetchError<404, types.GetSeriesPastResponse404> Not found
   * @throws FetchError<422, types.GetSeriesPastResponse422> Unprocessable Entity
   */
  get_series_past(metadata?: types.GetSeriesPastMetadataParam): Promise<FetchResponse<200, types.GetSeriesPastResponse200>> {
    return this.core.fetch('/series/past', 'get', metadata);
  }

  /**
   * List currently running series
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get running series
   * @throws FetchError<400, types.GetSeriesRunningResponse400> Bad request
   * @throws FetchError<401, types.GetSeriesRunningResponse401> Unauthorized
   * @throws FetchError<403, types.GetSeriesRunningResponse403> Forbidden
   * @throws FetchError<404, types.GetSeriesRunningResponse404> Not found
   * @throws FetchError<422, types.GetSeriesRunningResponse422> Unprocessable Entity
   */
  get_series_running(metadata?: types.GetSeriesRunningMetadataParam): Promise<FetchResponse<200, types.GetSeriesRunningResponse200>> {
    return this.core.fetch('/series/running', 'get', metadata);
  }

  /**
   * List upcoming series
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get upcoming series
   * @throws FetchError<400, types.GetSeriesUpcomingResponse400> Bad request
   * @throws FetchError<401, types.GetSeriesUpcomingResponse401> Unauthorized
   * @throws FetchError<403, types.GetSeriesUpcomingResponse403> Forbidden
   * @throws FetchError<404, types.GetSeriesUpcomingResponse404> Not found
   * @throws FetchError<422, types.GetSeriesUpcomingResponse422> Unprocessable Entity
   */
  get_series_upcoming(metadata?: types.GetSeriesUpcomingMetadataParam): Promise<FetchResponse<200, types.GetSeriesUpcomingResponse200>> {
    return this.core.fetch('/series/upcoming', 'get', metadata);
  }

  /**
   * Get a single serie by ID or by slug
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get a serie
   * @throws FetchError<400, types.GetSeriesSerieIdOrSlugResponse400> Bad request
   * @throws FetchError<401, types.GetSeriesSerieIdOrSlugResponse401> Unauthorized
   * @throws FetchError<403, types.GetSeriesSerieIdOrSlugResponse403> Forbidden
   * @throws FetchError<404, types.GetSeriesSerieIdOrSlugResponse404> Not found
   * @throws FetchError<422, types.GetSeriesSerieIdOrSlugResponse422> Unprocessable Entity
   */
  get_series_serieIdOrSlug(metadata: types.GetSeriesSerieIdOrSlugMetadataParam): Promise<FetchResponse<200, types.GetSeriesSerieIdOrSlugResponse200>> {
    return this.core.fetch('/series/{serie_id_or_slug}', 'get', metadata);
  }

  /**
   * List matches of the given serie
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get matches for a serie
   * @throws FetchError<400, types.GetSeriesSerieIdOrSlugMatchesResponse400> Bad request
   * @throws FetchError<401, types.GetSeriesSerieIdOrSlugMatchesResponse401> Unauthorized
   * @throws FetchError<403, types.GetSeriesSerieIdOrSlugMatchesResponse403> Forbidden
   * @throws FetchError<404, types.GetSeriesSerieIdOrSlugMatchesResponse404> Not found
   * @throws FetchError<422, types.GetSeriesSerieIdOrSlugMatchesResponse422> Unprocessable Entity
   */
  get_series_serieIdOrSlug_matches(metadata: types.GetSeriesSerieIdOrSlugMatchesMetadataParam): Promise<FetchResponse<200, types.GetSeriesSerieIdOrSlugMatchesResponse200>> {
    return this.core.fetch('/series/{serie_id_or_slug}/matches', 'get', metadata);
  }

  /**
   * List past matches for the given serie
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get past matches for serie
   * @throws FetchError<400, types.GetSeriesSerieIdOrSlugMatchesPastResponse400> Bad request
   * @throws FetchError<401, types.GetSeriesSerieIdOrSlugMatchesPastResponse401> Unauthorized
   * @throws FetchError<403, types.GetSeriesSerieIdOrSlugMatchesPastResponse403> Forbidden
   * @throws FetchError<404, types.GetSeriesSerieIdOrSlugMatchesPastResponse404> Not found
   * @throws FetchError<422, types.GetSeriesSerieIdOrSlugMatchesPastResponse422> Unprocessable Entity
   */
  get_series_serieIdOrSlug_matches_past(metadata: types.GetSeriesSerieIdOrSlugMatchesPastMetadataParam): Promise<FetchResponse<200, types.GetSeriesSerieIdOrSlugMatchesPastResponse200>> {
    return this.core.fetch('/series/{serie_id_or_slug}/matches/past', 'get', metadata);
  }

  /**
   * List currently running matches for the given serie
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get running matches for serie
   * @throws FetchError<400, types.GetSeriesSerieIdOrSlugMatchesRunningResponse400> Bad request
   * @throws FetchError<401, types.GetSeriesSerieIdOrSlugMatchesRunningResponse401> Unauthorized
   * @throws FetchError<403, types.GetSeriesSerieIdOrSlugMatchesRunningResponse403> Forbidden
   * @throws FetchError<404, types.GetSeriesSerieIdOrSlugMatchesRunningResponse404> Not found
   * @throws FetchError<422, types.GetSeriesSerieIdOrSlugMatchesRunningResponse422> Unprocessable Entity
   */
  get_series_serieIdOrSlug_matches_running(metadata: types.GetSeriesSerieIdOrSlugMatchesRunningMetadataParam): Promise<FetchResponse<200, types.GetSeriesSerieIdOrSlugMatchesRunningResponse200>> {
    return this.core.fetch('/series/{serie_id_or_slug}/matches/running', 'get', metadata);
  }

  /**
   * List upcoming matches for the given serie
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get upcoming matches for serie
   * @throws FetchError<400, types.GetSeriesSerieIdOrSlugMatchesUpcomingResponse400> Bad request
   * @throws FetchError<401, types.GetSeriesSerieIdOrSlugMatchesUpcomingResponse401> Unauthorized
   * @throws FetchError<403, types.GetSeriesSerieIdOrSlugMatchesUpcomingResponse403> Forbidden
   * @throws FetchError<404, types.GetSeriesSerieIdOrSlugMatchesUpcomingResponse404> Not found
   * @throws FetchError<422, types.GetSeriesSerieIdOrSlugMatchesUpcomingResponse422> Unprocessable Entity
   */
  get_series_serieIdOrSlug_matches_upcoming(metadata: types.GetSeriesSerieIdOrSlugMatchesUpcomingMetadataParam): Promise<FetchResponse<200, types.GetSeriesSerieIdOrSlugMatchesUpcomingResponse200>> {
    return this.core.fetch('/series/{serie_id_or_slug}/matches/upcoming', 'get', metadata);
  }

  /**
   * List tournaments of the given serie
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get tournaments for a serie
   * @throws FetchError<400, types.GetSeriesSerieIdOrSlugTournamentsResponse400> Bad request
   * @throws FetchError<401, types.GetSeriesSerieIdOrSlugTournamentsResponse401> Unauthorized
   * @throws FetchError<403, types.GetSeriesSerieIdOrSlugTournamentsResponse403> Forbidden
   * @throws FetchError<404, types.GetSeriesSerieIdOrSlugTournamentsResponse404> Not found
   * @throws FetchError<422, types.GetSeriesSerieIdOrSlugTournamentsResponse422> Unprocessable Entity
   */
  get_series_serieIdOrSlug_tournaments(metadata: types.GetSeriesSerieIdOrSlugTournamentsMetadataParam): Promise<FetchResponse<200, types.GetSeriesSerieIdOrSlugTournamentsResponse200>> {
    return this.core.fetch('/series/{serie_id_or_slug}/tournaments', 'get', metadata);
  }

  /**
   * List teams
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List teams
   * @throws FetchError<400, types.GetTeamsResponse400> Bad request
   * @throws FetchError<401, types.GetTeamsResponse401> Unauthorized
   * @throws FetchError<403, types.GetTeamsResponse403> Forbidden
   * @throws FetchError<404, types.GetTeamsResponse404> Not found
   * @throws FetchError<422, types.GetTeamsResponse422> Unprocessable Entity
   */
  get_teams(metadata?: types.GetTeamsMetadataParam): Promise<FetchResponse<200, types.GetTeamsResponse200>> {
    return this.core.fetch('/teams', 'get', metadata);
  }

  /**
   * Get a single team by ID or by slug
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get a team
   * @throws FetchError<400, types.GetTeamsTeamIdOrSlugResponse400> Bad request
   * @throws FetchError<401, types.GetTeamsTeamIdOrSlugResponse401> Unauthorized
   * @throws FetchError<403, types.GetTeamsTeamIdOrSlugResponse403> Forbidden
   * @throws FetchError<404, types.GetTeamsTeamIdOrSlugResponse404> Not found
   * @throws FetchError<422, types.GetTeamsTeamIdOrSlugResponse422> Unprocessable Entity
   */
  get_teams_teamIdOrSlug(metadata: types.GetTeamsTeamIdOrSlugMetadataParam): Promise<FetchResponse<200, types.GetTeamsTeamIdOrSlugResponse200>> {
    return this.core.fetch('/teams/{team_id_or_slug}', 'get', metadata);
  }

  /**
   * List leagues in which the given team was part of
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get leagues for a team
   * @throws FetchError<400, types.GetTeamsTeamIdOrSlugLeaguesResponse400> Bad request
   * @throws FetchError<401, types.GetTeamsTeamIdOrSlugLeaguesResponse401> Unauthorized
   * @throws FetchError<403, types.GetTeamsTeamIdOrSlugLeaguesResponse403> Forbidden
   * @throws FetchError<404, types.GetTeamsTeamIdOrSlugLeaguesResponse404> Not found
   * @throws FetchError<422, types.GetTeamsTeamIdOrSlugLeaguesResponse422> Unprocessable Entity
   */
  get_teams_teamIdOrSlug_leagues(metadata: types.GetTeamsTeamIdOrSlugLeaguesMetadataParam): Promise<FetchResponse<200, types.GetTeamsTeamIdOrSlugLeaguesResponse200>> {
    return this.core.fetch('/teams/{team_id_or_slug}/leagues', 'get', metadata);
  }

  /**
   * List matches for the given team
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get matches for team
   * @throws FetchError<400, types.GetTeamsTeamIdOrSlugMatchesResponse400> Bad request
   * @throws FetchError<401, types.GetTeamsTeamIdOrSlugMatchesResponse401> Unauthorized
   * @throws FetchError<403, types.GetTeamsTeamIdOrSlugMatchesResponse403> Forbidden
   * @throws FetchError<404, types.GetTeamsTeamIdOrSlugMatchesResponse404> Not found
   * @throws FetchError<422, types.GetTeamsTeamIdOrSlugMatchesResponse422> Unprocessable Entity
   */
  get_teams_teamIdOrSlug_matches(metadata: types.GetTeamsTeamIdOrSlugMatchesMetadataParam): Promise<FetchResponse<200, types.GetTeamsTeamIdOrSlugMatchesResponse200>> {
    return this.core.fetch('/teams/{team_id_or_slug}/matches', 'get', metadata);
  }

  /**
   * List series in which the given team was part of
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get series for a team
   * @throws FetchError<400, types.GetTeamsTeamIdOrSlugSeriesResponse400> Bad request
   * @throws FetchError<401, types.GetTeamsTeamIdOrSlugSeriesResponse401> Unauthorized
   * @throws FetchError<403, types.GetTeamsTeamIdOrSlugSeriesResponse403> Forbidden
   * @throws FetchError<404, types.GetTeamsTeamIdOrSlugSeriesResponse404> Not found
   * @throws FetchError<422, types.GetTeamsTeamIdOrSlugSeriesResponse422> Unprocessable Entity
   */
  get_teams_teamIdOrSlug_series(metadata: types.GetTeamsTeamIdOrSlugSeriesMetadataParam): Promise<FetchResponse<200, types.GetTeamsTeamIdOrSlugSeriesResponse200>> {
    return this.core.fetch('/teams/{team_id_or_slug}/series', 'get', metadata);
  }

  /**
   * List tournaments in which the given team was part of
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get tournaments for a team
   * @throws FetchError<400, types.GetTeamsTeamIdOrSlugTournamentsResponse400> Bad request
   * @throws FetchError<401, types.GetTeamsTeamIdOrSlugTournamentsResponse401> Unauthorized
   * @throws FetchError<403, types.GetTeamsTeamIdOrSlugTournamentsResponse403> Forbidden
   * @throws FetchError<404, types.GetTeamsTeamIdOrSlugTournamentsResponse404> Not found
   * @throws FetchError<422, types.GetTeamsTeamIdOrSlugTournamentsResponse422> Unprocessable Entity
   */
  get_teams_teamIdOrSlug_tournaments(metadata: types.GetTeamsTeamIdOrSlugTournamentsMetadataParam): Promise<FetchResponse<200, types.GetTeamsTeamIdOrSlugTournamentsResponse200>> {
    return this.core.fetch('/teams/{team_id_or_slug}/tournaments', 'get', metadata);
  }

  /**
   * List tournaments
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List tournaments
   * @throws FetchError<400, types.GetTournamentsResponse400> Bad request
   * @throws FetchError<401, types.GetTournamentsResponse401> Unauthorized
   * @throws FetchError<403, types.GetTournamentsResponse403> Forbidden
   * @throws FetchError<404, types.GetTournamentsResponse404> Not found
   * @throws FetchError<422, types.GetTournamentsResponse422> Unprocessable Entity
   */
  get_tournaments(metadata?: types.GetTournamentsMetadataParam): Promise<FetchResponse<200, types.GetTournamentsResponse200>> {
    return this.core.fetch('/tournaments', 'get', metadata);
  }

  /**
   * List past tournaments
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get past tournaments
   * @throws FetchError<400, types.GetTournamentsPastResponse400> Bad request
   * @throws FetchError<401, types.GetTournamentsPastResponse401> Unauthorized
   * @throws FetchError<403, types.GetTournamentsPastResponse403> Forbidden
   * @throws FetchError<404, types.GetTournamentsPastResponse404> Not found
   * @throws FetchError<422, types.GetTournamentsPastResponse422> Unprocessable Entity
   */
  get_tournaments_past(metadata?: types.GetTournamentsPastMetadataParam): Promise<FetchResponse<200, types.GetTournamentsPastResponse200>> {
    return this.core.fetch('/tournaments/past', 'get', metadata);
  }

  /**
   * List currently running tournaments
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get running tournaments
   * @throws FetchError<400, types.GetTournamentsRunningResponse400> Bad request
   * @throws FetchError<401, types.GetTournamentsRunningResponse401> Unauthorized
   * @throws FetchError<403, types.GetTournamentsRunningResponse403> Forbidden
   * @throws FetchError<404, types.GetTournamentsRunningResponse404> Not found
   * @throws FetchError<422, types.GetTournamentsRunningResponse422> Unprocessable Entity
   */
  get_tournaments_running(metadata?: types.GetTournamentsRunningMetadataParam): Promise<FetchResponse<200, types.GetTournamentsRunningResponse200>> {
    return this.core.fetch('/tournaments/running', 'get', metadata);
  }

  /**
   * List upcoming tournaments
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get upcoming tournaments
   * @throws FetchError<400, types.GetTournamentsUpcomingResponse400> Bad request
   * @throws FetchError<401, types.GetTournamentsUpcomingResponse401> Unauthorized
   * @throws FetchError<403, types.GetTournamentsUpcomingResponse403> Forbidden
   * @throws FetchError<404, types.GetTournamentsUpcomingResponse404> Not found
   * @throws FetchError<422, types.GetTournamentsUpcomingResponse422> Unprocessable Entity
   */
  get_tournaments_upcoming(metadata?: types.GetTournamentsUpcomingMetadataParam): Promise<FetchResponse<200, types.GetTournamentsUpcomingResponse200>> {
    return this.core.fetch('/tournaments/upcoming', 'get', metadata);
  }

  /**
   * Get a single tournament by ID or by slug
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get a tournament
   * @throws FetchError<400, types.GetTournamentsTournamentIdOrSlugResponse400> Bad request
   * @throws FetchError<401, types.GetTournamentsTournamentIdOrSlugResponse401> Unauthorized
   * @throws FetchError<403, types.GetTournamentsTournamentIdOrSlugResponse403> Forbidden
   * @throws FetchError<404, types.GetTournamentsTournamentIdOrSlugResponse404> Not found
   * @throws FetchError<422, types.GetTournamentsTournamentIdOrSlugResponse422> Unprocessable Entity
   */
  get_tournaments_tournamentIdOrSlug(metadata: types.GetTournamentsTournamentIdOrSlugMetadataParam): Promise<FetchResponse<200, types.GetTournamentsTournamentIdOrSlugResponse200>> {
    return this.core.fetch('/tournaments/{tournament_id_or_slug}', 'get', metadata);
  }

  /**
   * Get the brackets of the given tournament
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get a tournament's brackets
   * @throws FetchError<400, types.GetTournamentsTournamentIdOrSlugBracketsResponse400> Bad request
   * @throws FetchError<401, types.GetTournamentsTournamentIdOrSlugBracketsResponse401> Unauthorized
   * @throws FetchError<403, types.GetTournamentsTournamentIdOrSlugBracketsResponse403> Forbidden
   * @throws FetchError<404, types.GetTournamentsTournamentIdOrSlugBracketsResponse404> Not found
   * @throws FetchError<422, types.GetTournamentsTournamentIdOrSlugBracketsResponse422> Unprocessable Entity
   */
  get_tournaments_tournamentIdOrSlug_brackets(metadata: types.GetTournamentsTournamentIdOrSlugBracketsMetadataParam): Promise<FetchResponse<200, types.GetTournamentsTournamentIdOrSlugBracketsResponse200>> {
    return this.core.fetch('/tournaments/{tournament_id_or_slug}/brackets', 'get', metadata);
  }

  /**
   * List matches for the given tournament
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get matches for tournament
   * @throws FetchError<400, types.GetTournamentsTournamentIdOrSlugMatchesResponse400> Bad request
   * @throws FetchError<401, types.GetTournamentsTournamentIdOrSlugMatchesResponse401> Unauthorized
   * @throws FetchError<403, types.GetTournamentsTournamentIdOrSlugMatchesResponse403> Forbidden
   * @throws FetchError<404, types.GetTournamentsTournamentIdOrSlugMatchesResponse404> Not found
   * @throws FetchError<422, types.GetTournamentsTournamentIdOrSlugMatchesResponse422> Unprocessable Entity
   */
  get_tournaments_tournamentIdOrSlug_matches(metadata: types.GetTournamentsTournamentIdOrSlugMatchesMetadataParam): Promise<FetchResponse<200, types.GetTournamentsTournamentIdOrSlugMatchesResponse200>> {
    return this.core.fetch('/tournaments/{tournament_id_or_slug}/matches', 'get', metadata);
  }

  /**
   * List participants (player or team) for a given tournament.
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get rosters for a tournament
   * @throws FetchError<400, types.GetTournamentsTournamentIdOrSlugRostersResponse400> Bad request
   * @throws FetchError<401, types.GetTournamentsTournamentIdOrSlugRostersResponse401> Unauthorized
   * @throws FetchError<403, types.GetTournamentsTournamentIdOrSlugRostersResponse403> Forbidden
   * @throws FetchError<404, types.GetTournamentsTournamentIdOrSlugRostersResponse404> Not found
   * @throws FetchError<422, types.GetTournamentsTournamentIdOrSlugRostersResponse422> Unprocessable Entity
   */
  get_tournaments_tournamentIdOrSlug_rosters(metadata: types.GetTournamentsTournamentIdOrSlugRostersMetadataParam): Promise<FetchResponse<200, types.GetTournamentsTournamentIdOrSlugRostersResponse200>> {
    return this.core.fetch('/tournaments/{tournament_id_or_slug}/rosters', 'get', metadata);
  }

  /**
   * Get the current standings for a given tournament
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get tournament standings
   * @throws FetchError<400, types.GetTournamentsTournamentIdOrSlugStandingsResponse400> Bad request
   * @throws FetchError<401, types.GetTournamentsTournamentIdOrSlugStandingsResponse401> Unauthorized
   * @throws FetchError<403, types.GetTournamentsTournamentIdOrSlugStandingsResponse403> Forbidden
   * @throws FetchError<404, types.GetTournamentsTournamentIdOrSlugStandingsResponse404> Not found
   * @throws FetchError<422, types.GetTournamentsTournamentIdOrSlugStandingsResponse422> Unprocessable Entity
   */
  get_tournaments_tournamentIdOrSlug_standings(metadata: types.GetTournamentsTournamentIdOrSlugStandingsMetadataParam): Promise<FetchResponse<200, types.GetTournamentsTournamentIdOrSlugStandingsResponse200>> {
    return this.core.fetch('/tournaments/{tournament_id_or_slug}/standings', 'get', metadata);
  }

  /**
   * List teams for the given tournament
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get teams for a tournament
   * @throws FetchError<400, types.GetTournamentsTournamentIdOrSlugTeamsResponse400> Bad request
   * @throws FetchError<401, types.GetTournamentsTournamentIdOrSlugTeamsResponse401> Unauthorized
   * @throws FetchError<403, types.GetTournamentsTournamentIdOrSlugTeamsResponse403> Forbidden
   * @throws FetchError<404, types.GetTournamentsTournamentIdOrSlugTeamsResponse404> Not found
   * @throws FetchError<422, types.GetTournamentsTournamentIdOrSlugTeamsResponse422> Unprocessable Entity
   */
  get_tournaments_tournamentIdOrSlug_teams(metadata: types.GetTournamentsTournamentIdOrSlugTeamsMetadataParam): Promise<FetchResponse<200, types.GetTournamentsTournamentIdOrSlugTeamsResponse200>> {
    return this.core.fetch('/tournaments/{tournament_id_or_slug}/teams', 'get', metadata);
  }

  /**
   * List videogames
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List videogames
   * @throws FetchError<400, types.GetVideogamesResponse400> Bad request
   * @throws FetchError<401, types.GetVideogamesResponse401> Unauthorized
   * @throws FetchError<403, types.GetVideogamesResponse403> Forbidden
   * @throws FetchError<404, types.GetVideogamesResponse404> Not found
   * @throws FetchError<422, types.GetVideogamesResponse422> Unprocessable Entity
   */
  get_videogames(metadata?: types.GetVideogamesMetadataParam): Promise<FetchResponse<200, types.GetVideogamesResponse200>> {
    return this.core.fetch('/videogames', 'get', metadata);
  }

  /**
   * Get a single videogame by ID or by slug
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get a videogame
   * @throws FetchError<400, types.GetVideogamesVideogameIdOrSlugResponse400> Bad request
   * @throws FetchError<401, types.GetVideogamesVideogameIdOrSlugResponse401> Unauthorized
   * @throws FetchError<403, types.GetVideogamesVideogameIdOrSlugResponse403> Forbidden
   * @throws FetchError<404, types.GetVideogamesVideogameIdOrSlugResponse404> Not found
   * @throws FetchError<422, types.GetVideogamesVideogameIdOrSlugResponse422> Unprocessable Entity
   */
  get_videogames_videogameIdOrSlug(metadata: types.GetVideogamesVideogameIdOrSlugMetadataParam): Promise<FetchResponse<200, types.GetVideogamesVideogameIdOrSlugResponse200>> {
    return this.core.fetch('/videogames/{videogame_id_or_slug}', 'get', metadata);
  }

  /**
   * List leagues for a given videogame
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List leagues for a videogame
   * @throws FetchError<400, types.GetVideogamesVideogameIdOrSlugLeaguesResponse400> Bad request
   * @throws FetchError<401, types.GetVideogamesVideogameIdOrSlugLeaguesResponse401> Unauthorized
   * @throws FetchError<403, types.GetVideogamesVideogameIdOrSlugLeaguesResponse403> Forbidden
   * @throws FetchError<404, types.GetVideogamesVideogameIdOrSlugLeaguesResponse404> Not found
   * @throws FetchError<422, types.GetVideogamesVideogameIdOrSlugLeaguesResponse422> Unprocessable Entity
   */
  get_videogames_videogameIdOrSlug_leagues(metadata: types.GetVideogamesVideogameIdOrSlugLeaguesMetadataParam): Promise<FetchResponse<200, types.GetVideogamesVideogameIdOrSlugLeaguesResponse200>> {
    return this.core.fetch('/videogames/{videogame_id_or_slug}/leagues', 'get', metadata);
  }

  /**
   * List series for the given videogame
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List series for a videogame
   * @throws FetchError<400, types.GetVideogamesVideogameIdOrSlugSeriesResponse400> Bad request
   * @throws FetchError<401, types.GetVideogamesVideogameIdOrSlugSeriesResponse401> Unauthorized
   * @throws FetchError<403, types.GetVideogamesVideogameIdOrSlugSeriesResponse403> Forbidden
   * @throws FetchError<404, types.GetVideogamesVideogameIdOrSlugSeriesResponse404> Not found
   * @throws FetchError<422, types.GetVideogamesVideogameIdOrSlugSeriesResponse422> Unprocessable Entity
   */
  get_videogames_videogameIdOrSlug_series(metadata: types.GetVideogamesVideogameIdOrSlugSeriesMetadataParam): Promise<FetchResponse<200, types.GetVideogamesVideogameIdOrSlugSeriesResponse200>> {
    return this.core.fetch('/videogames/{videogame_id_or_slug}/series', 'get', metadata);
  }

  /**
   * List available titles for a given videogame
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List videogame titles
   * @throws FetchError<400, types.GetVideogamesVideogameIdOrSlugTitlesResponse400> Bad request
   * @throws FetchError<401, types.GetVideogamesVideogameIdOrSlugTitlesResponse401> Unauthorized
   * @throws FetchError<403, types.GetVideogamesVideogameIdOrSlugTitlesResponse403> Forbidden
   * @throws FetchError<404, types.GetVideogamesVideogameIdOrSlugTitlesResponse404> Not found
   * @throws FetchError<422, types.GetVideogamesVideogameIdOrSlugTitlesResponse422> Unprocessable Entity
   */
  get_videogames_videogameIdOrSlug_titles(metadata: types.GetVideogamesVideogameIdOrSlugTitlesMetadataParam): Promise<FetchResponse<200, types.GetVideogamesVideogameIdOrSlugTitlesResponse200>> {
    return this.core.fetch('/videogames/{videogame_id_or_slug}/titles', 'get', metadata);
  }

  /**
   * List tournaments of the given videogame
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary Get tournaments for a videogame
   * @throws FetchError<400, types.GetVideogamesVideogameIdOrSlugTournamentsResponse400> Bad request
   * @throws FetchError<401, types.GetVideogamesVideogameIdOrSlugTournamentsResponse401> Unauthorized
   * @throws FetchError<403, types.GetVideogamesVideogameIdOrSlugTournamentsResponse403> Forbidden
   * @throws FetchError<404, types.GetVideogamesVideogameIdOrSlugTournamentsResponse404> Not found
   * @throws FetchError<422, types.GetVideogamesVideogameIdOrSlugTournamentsResponse422> Unprocessable Entity
   */
  get_videogames_videogameIdOrSlug_tournaments(metadata: types.GetVideogamesVideogameIdOrSlugTournamentsMetadataParam): Promise<FetchResponse<200, types.GetVideogamesVideogameIdOrSlugTournamentsResponse200>> {
    return this.core.fetch('/videogames/{videogame_id_or_slug}/tournaments', 'get', metadata);
  }

  /**
   * List available versions for a given videogame
   * > ℹ️  
   * > 
   * > This endpoint is available to all customers
   *
   * @summary List videogame versions
   * @throws FetchError<400, types.GetVideogamesVideogameIdOrSlugVersionsResponse400> Bad request
   * @throws FetchError<401, types.GetVideogamesVideogameIdOrSlugVersionsResponse401> Unauthorized
   * @throws FetchError<403, types.GetVideogamesVideogameIdOrSlugVersionsResponse403> Forbidden
   * @throws FetchError<404, types.GetVideogamesVideogameIdOrSlugVersionsResponse404> Not found
   * @throws FetchError<422, types.GetVideogamesVideogameIdOrSlugVersionsResponse422> Unprocessable Entity
   */
  get_videogames_videogameIdOrSlug_versions(metadata: types.GetVideogamesVideogameIdOrSlugVersionsMetadataParam): Promise<FetchResponse<200, types.GetVideogamesVideogameIdOrSlugVersionsResponse200>> {
    return this.core.fetch('/videogames/{videogame_id_or_slug}/versions', 'get', metadata);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { GetAdditionsMetadataParam, GetAdditionsResponse200, GetAdditionsResponse400, GetAdditionsResponse401, GetAdditionsResponse403, GetAdditionsResponse404, GetAdditionsResponse422, GetChangesMetadataParam, GetChangesResponse200, GetChangesResponse400, GetChangesResponse401, GetChangesResponse403, GetChangesResponse404, GetChangesResponse422, GetDeletionsMetadataParam, GetDeletionsResponse200, GetDeletionsResponse400, GetDeletionsResponse401, GetDeletionsResponse403, GetDeletionsResponse404, GetDeletionsResponse422, GetIncidentsMetadataParam, GetIncidentsResponse200, GetIncidentsResponse400, GetIncidentsResponse401, GetIncidentsResponse403, GetIncidentsResponse404, GetIncidentsResponse422, GetLeaguesLeagueIdOrSlugMatchesMetadataParam, GetLeaguesLeagueIdOrSlugMatchesPastMetadataParam, GetLeaguesLeagueIdOrSlugMatchesPastResponse200, GetLeaguesLeagueIdOrSlugMatchesPastResponse400, GetLeaguesLeagueIdOrSlugMatchesPastResponse401, GetLeaguesLeagueIdOrSlugMatchesPastResponse403, GetLeaguesLeagueIdOrSlugMatchesPastResponse404, GetLeaguesLeagueIdOrSlugMatchesPastResponse422, GetLeaguesLeagueIdOrSlugMatchesResponse200, GetLeaguesLeagueIdOrSlugMatchesResponse400, GetLeaguesLeagueIdOrSlugMatchesResponse401, GetLeaguesLeagueIdOrSlugMatchesResponse403, GetLeaguesLeagueIdOrSlugMatchesResponse404, GetLeaguesLeagueIdOrSlugMatchesResponse422, GetLeaguesLeagueIdOrSlugMatchesRunningMetadataParam, GetLeaguesLeagueIdOrSlugMatchesRunningResponse200, GetLeaguesLeagueIdOrSlugMatchesRunningResponse400, GetLeaguesLeagueIdOrSlugMatchesRunningResponse401, GetLeaguesLeagueIdOrSlugMatchesRunningResponse403, GetLeaguesLeagueIdOrSlugMatchesRunningResponse404, GetLeaguesLeagueIdOrSlugMatchesRunningResponse422, GetLeaguesLeagueIdOrSlugMatchesUpcomingMetadataParam, GetLeaguesLeagueIdOrSlugMatchesUpcomingResponse200, GetLeaguesLeagueIdOrSlugMatchesUpcomingResponse400, GetLeaguesLeagueIdOrSlugMatchesUpcomingResponse401, GetLeaguesLeagueIdOrSlugMatchesUpcomingResponse403, GetLeaguesLeagueIdOrSlugMatchesUpcomingResponse404, GetLeaguesLeagueIdOrSlugMatchesUpcomingResponse422, GetLeaguesLeagueIdOrSlugMetadataParam, GetLeaguesLeagueIdOrSlugResponse200, GetLeaguesLeagueIdOrSlugResponse400, GetLeaguesLeagueIdOrSlugResponse401, GetLeaguesLeagueIdOrSlugResponse403, GetLeaguesLeagueIdOrSlugResponse404, GetLeaguesLeagueIdOrSlugResponse422, GetLeaguesLeagueIdOrSlugSeriesMetadataParam, GetLeaguesLeagueIdOrSlugSeriesResponse200, GetLeaguesLeagueIdOrSlugSeriesResponse400, GetLeaguesLeagueIdOrSlugSeriesResponse401, GetLeaguesLeagueIdOrSlugSeriesResponse403, GetLeaguesLeagueIdOrSlugSeriesResponse404, GetLeaguesLeagueIdOrSlugSeriesResponse422, GetLeaguesLeagueIdOrSlugTournamentsMetadataParam, GetLeaguesLeagueIdOrSlugTournamentsResponse200, GetLeaguesLeagueIdOrSlugTournamentsResponse400, GetLeaguesLeagueIdOrSlugTournamentsResponse401, GetLeaguesLeagueIdOrSlugTournamentsResponse403, GetLeaguesLeagueIdOrSlugTournamentsResponse404, GetLeaguesLeagueIdOrSlugTournamentsResponse422, GetLeaguesMetadataParam, GetLeaguesResponse200, GetLeaguesResponse400, GetLeaguesResponse401, GetLeaguesResponse403, GetLeaguesResponse404, GetLeaguesResponse422, GetLivesMetadataParam, GetLivesResponse200, GetLivesResponse400, GetLivesResponse401, GetLivesResponse403, GetLivesResponse404, GetLivesResponse422, GetMatchesMatchIdOrSlugMetadataParam, GetMatchesMatchIdOrSlugOpponentsMetadataParam, GetMatchesMatchIdOrSlugOpponentsResponse200, GetMatchesMatchIdOrSlugOpponentsResponse400, GetMatchesMatchIdOrSlugOpponentsResponse401, GetMatchesMatchIdOrSlugOpponentsResponse403, GetMatchesMatchIdOrSlugOpponentsResponse404, GetMatchesMatchIdOrSlugOpponentsResponse422, GetMatchesMatchIdOrSlugResponse200, GetMatchesMatchIdOrSlugResponse400, GetMatchesMatchIdOrSlugResponse401, GetMatchesMatchIdOrSlugResponse403, GetMatchesMatchIdOrSlugResponse404, GetMatchesMatchIdOrSlugResponse422, GetMatchesMetadataParam, GetMatchesPastMetadataParam, GetMatchesPastResponse200, GetMatchesPastResponse400, GetMatchesPastResponse401, GetMatchesPastResponse403, GetMatchesPastResponse404, GetMatchesPastResponse422, GetMatchesResponse200, GetMatchesResponse400, GetMatchesResponse401, GetMatchesResponse403, GetMatchesResponse404, GetMatchesResponse422, GetMatchesRunningMetadataParam, GetMatchesRunningResponse200, GetMatchesRunningResponse400, GetMatchesRunningResponse401, GetMatchesRunningResponse403, GetMatchesRunningResponse404, GetMatchesRunningResponse422, GetMatchesUpcomingMetadataParam, GetMatchesUpcomingResponse200, GetMatchesUpcomingResponse400, GetMatchesUpcomingResponse401, GetMatchesUpcomingResponse403, GetMatchesUpcomingResponse404, GetMatchesUpcomingResponse422, GetPlayersMetadataParam, GetPlayersPlayerIdOrSlugLeaguesMetadataParam, GetPlayersPlayerIdOrSlugLeaguesResponse200, GetPlayersPlayerIdOrSlugLeaguesResponse400, GetPlayersPlayerIdOrSlugLeaguesResponse401, GetPlayersPlayerIdOrSlugLeaguesResponse403, GetPlayersPlayerIdOrSlugLeaguesResponse404, GetPlayersPlayerIdOrSlugLeaguesResponse422, GetPlayersPlayerIdOrSlugMatchesMetadataParam, GetPlayersPlayerIdOrSlugMatchesResponse200, GetPlayersPlayerIdOrSlugMatchesResponse400, GetPlayersPlayerIdOrSlugMatchesResponse401, GetPlayersPlayerIdOrSlugMatchesResponse403, GetPlayersPlayerIdOrSlugMatchesResponse404, GetPlayersPlayerIdOrSlugMatchesResponse422, GetPlayersPlayerIdOrSlugMetadataParam, GetPlayersPlayerIdOrSlugResponse200, GetPlayersPlayerIdOrSlugResponse400, GetPlayersPlayerIdOrSlugResponse401, GetPlayersPlayerIdOrSlugResponse403, GetPlayersPlayerIdOrSlugResponse404, GetPlayersPlayerIdOrSlugResponse422, GetPlayersPlayerIdOrSlugSeriesMetadataParam, GetPlayersPlayerIdOrSlugSeriesResponse200, GetPlayersPlayerIdOrSlugSeriesResponse400, GetPlayersPlayerIdOrSlugSeriesResponse401, GetPlayersPlayerIdOrSlugSeriesResponse403, GetPlayersPlayerIdOrSlugSeriesResponse404, GetPlayersPlayerIdOrSlugSeriesResponse422, GetPlayersPlayerIdOrSlugTournamentsMetadataParam, GetPlayersPlayerIdOrSlugTournamentsResponse200, GetPlayersPlayerIdOrSlugTournamentsResponse400, GetPlayersPlayerIdOrSlugTournamentsResponse401, GetPlayersPlayerIdOrSlugTournamentsResponse403, GetPlayersPlayerIdOrSlugTournamentsResponse404, GetPlayersPlayerIdOrSlugTournamentsResponse422, GetPlayersResponse200, GetPlayersResponse400, GetPlayersResponse401, GetPlayersResponse403, GetPlayersResponse404, GetPlayersResponse422, GetSeriesMetadataParam, GetSeriesPastMetadataParam, GetSeriesPastResponse200, GetSeriesPastResponse400, GetSeriesPastResponse401, GetSeriesPastResponse403, GetSeriesPastResponse404, GetSeriesPastResponse422, GetSeriesResponse200, GetSeriesResponse400, GetSeriesResponse401, GetSeriesResponse403, GetSeriesResponse404, GetSeriesResponse422, GetSeriesRunningMetadataParam, GetSeriesRunningResponse200, GetSeriesRunningResponse400, GetSeriesRunningResponse401, GetSeriesRunningResponse403, GetSeriesRunningResponse404, GetSeriesRunningResponse422, GetSeriesSerieIdOrSlugMatchesMetadataParam, GetSeriesSerieIdOrSlugMatchesPastMetadataParam, GetSeriesSerieIdOrSlugMatchesPastResponse200, GetSeriesSerieIdOrSlugMatchesPastResponse400, GetSeriesSerieIdOrSlugMatchesPastResponse401, GetSeriesSerieIdOrSlugMatchesPastResponse403, GetSeriesSerieIdOrSlugMatchesPastResponse404, GetSeriesSerieIdOrSlugMatchesPastResponse422, GetSeriesSerieIdOrSlugMatchesResponse200, GetSeriesSerieIdOrSlugMatchesResponse400, GetSeriesSerieIdOrSlugMatchesResponse401, GetSeriesSerieIdOrSlugMatchesResponse403, GetSeriesSerieIdOrSlugMatchesResponse404, GetSeriesSerieIdOrSlugMatchesResponse422, GetSeriesSerieIdOrSlugMatchesRunningMetadataParam, GetSeriesSerieIdOrSlugMatchesRunningResponse200, GetSeriesSerieIdOrSlugMatchesRunningResponse400, GetSeriesSerieIdOrSlugMatchesRunningResponse401, GetSeriesSerieIdOrSlugMatchesRunningResponse403, GetSeriesSerieIdOrSlugMatchesRunningResponse404, GetSeriesSerieIdOrSlugMatchesRunningResponse422, GetSeriesSerieIdOrSlugMatchesUpcomingMetadataParam, GetSeriesSerieIdOrSlugMatchesUpcomingResponse200, GetSeriesSerieIdOrSlugMatchesUpcomingResponse400, GetSeriesSerieIdOrSlugMatchesUpcomingResponse401, GetSeriesSerieIdOrSlugMatchesUpcomingResponse403, GetSeriesSerieIdOrSlugMatchesUpcomingResponse404, GetSeriesSerieIdOrSlugMatchesUpcomingResponse422, GetSeriesSerieIdOrSlugMetadataParam, GetSeriesSerieIdOrSlugResponse200, GetSeriesSerieIdOrSlugResponse400, GetSeriesSerieIdOrSlugResponse401, GetSeriesSerieIdOrSlugResponse403, GetSeriesSerieIdOrSlugResponse404, GetSeriesSerieIdOrSlugResponse422, GetSeriesSerieIdOrSlugTournamentsMetadataParam, GetSeriesSerieIdOrSlugTournamentsResponse200, GetSeriesSerieIdOrSlugTournamentsResponse400, GetSeriesSerieIdOrSlugTournamentsResponse401, GetSeriesSerieIdOrSlugTournamentsResponse403, GetSeriesSerieIdOrSlugTournamentsResponse404, GetSeriesSerieIdOrSlugTournamentsResponse422, GetSeriesUpcomingMetadataParam, GetSeriesUpcomingResponse200, GetSeriesUpcomingResponse400, GetSeriesUpcomingResponse401, GetSeriesUpcomingResponse403, GetSeriesUpcomingResponse404, GetSeriesUpcomingResponse422, GetTeamsMetadataParam, GetTeamsResponse200, GetTeamsResponse400, GetTeamsResponse401, GetTeamsResponse403, GetTeamsResponse404, GetTeamsResponse422, GetTeamsTeamIdOrSlugLeaguesMetadataParam, GetTeamsTeamIdOrSlugLeaguesResponse200, GetTeamsTeamIdOrSlugLeaguesResponse400, GetTeamsTeamIdOrSlugLeaguesResponse401, GetTeamsTeamIdOrSlugLeaguesResponse403, GetTeamsTeamIdOrSlugLeaguesResponse404, GetTeamsTeamIdOrSlugLeaguesResponse422, GetTeamsTeamIdOrSlugMatchesMetadataParam, GetTeamsTeamIdOrSlugMatchesResponse200, GetTeamsTeamIdOrSlugMatchesResponse400, GetTeamsTeamIdOrSlugMatchesResponse401, GetTeamsTeamIdOrSlugMatchesResponse403, GetTeamsTeamIdOrSlugMatchesResponse404, GetTeamsTeamIdOrSlugMatchesResponse422, GetTeamsTeamIdOrSlugMetadataParam, GetTeamsTeamIdOrSlugResponse200, GetTeamsTeamIdOrSlugResponse400, GetTeamsTeamIdOrSlugResponse401, GetTeamsTeamIdOrSlugResponse403, GetTeamsTeamIdOrSlugResponse404, GetTeamsTeamIdOrSlugResponse422, GetTeamsTeamIdOrSlugSeriesMetadataParam, GetTeamsTeamIdOrSlugSeriesResponse200, GetTeamsTeamIdOrSlugSeriesResponse400, GetTeamsTeamIdOrSlugSeriesResponse401, GetTeamsTeamIdOrSlugSeriesResponse403, GetTeamsTeamIdOrSlugSeriesResponse404, GetTeamsTeamIdOrSlugSeriesResponse422, GetTeamsTeamIdOrSlugTournamentsMetadataParam, GetTeamsTeamIdOrSlugTournamentsResponse200, GetTeamsTeamIdOrSlugTournamentsResponse400, GetTeamsTeamIdOrSlugTournamentsResponse401, GetTeamsTeamIdOrSlugTournamentsResponse403, GetTeamsTeamIdOrSlugTournamentsResponse404, GetTeamsTeamIdOrSlugTournamentsResponse422, GetTournamentsMetadataParam, GetTournamentsPastMetadataParam, GetTournamentsPastResponse200, GetTournamentsPastResponse400, GetTournamentsPastResponse401, GetTournamentsPastResponse403, GetTournamentsPastResponse404, GetTournamentsPastResponse422, GetTournamentsResponse200, GetTournamentsResponse400, GetTournamentsResponse401, GetTournamentsResponse403, GetTournamentsResponse404, GetTournamentsResponse422, GetTournamentsRunningMetadataParam, GetTournamentsRunningResponse200, GetTournamentsRunningResponse400, GetTournamentsRunningResponse401, GetTournamentsRunningResponse403, GetTournamentsRunningResponse404, GetTournamentsRunningResponse422, GetTournamentsTournamentIdOrSlugBracketsMetadataParam, GetTournamentsTournamentIdOrSlugBracketsResponse200, GetTournamentsTournamentIdOrSlugBracketsResponse400, GetTournamentsTournamentIdOrSlugBracketsResponse401, GetTournamentsTournamentIdOrSlugBracketsResponse403, GetTournamentsTournamentIdOrSlugBracketsResponse404, GetTournamentsTournamentIdOrSlugBracketsResponse422, GetTournamentsTournamentIdOrSlugMatchesMetadataParam, GetTournamentsTournamentIdOrSlugMatchesResponse200, GetTournamentsTournamentIdOrSlugMatchesResponse400, GetTournamentsTournamentIdOrSlugMatchesResponse401, GetTournamentsTournamentIdOrSlugMatchesResponse403, GetTournamentsTournamentIdOrSlugMatchesResponse404, GetTournamentsTournamentIdOrSlugMatchesResponse422, GetTournamentsTournamentIdOrSlugMetadataParam, GetTournamentsTournamentIdOrSlugResponse200, GetTournamentsTournamentIdOrSlugResponse400, GetTournamentsTournamentIdOrSlugResponse401, GetTournamentsTournamentIdOrSlugResponse403, GetTournamentsTournamentIdOrSlugResponse404, GetTournamentsTournamentIdOrSlugResponse422, GetTournamentsTournamentIdOrSlugRostersMetadataParam, GetTournamentsTournamentIdOrSlugRostersResponse200, GetTournamentsTournamentIdOrSlugRostersResponse400, GetTournamentsTournamentIdOrSlugRostersResponse401, GetTournamentsTournamentIdOrSlugRostersResponse403, GetTournamentsTournamentIdOrSlugRostersResponse404, GetTournamentsTournamentIdOrSlugRostersResponse422, GetTournamentsTournamentIdOrSlugStandingsMetadataParam, GetTournamentsTournamentIdOrSlugStandingsResponse200, GetTournamentsTournamentIdOrSlugStandingsResponse400, GetTournamentsTournamentIdOrSlugStandingsResponse401, GetTournamentsTournamentIdOrSlugStandingsResponse403, GetTournamentsTournamentIdOrSlugStandingsResponse404, GetTournamentsTournamentIdOrSlugStandingsResponse422, GetTournamentsTournamentIdOrSlugTeamsMetadataParam, GetTournamentsTournamentIdOrSlugTeamsResponse200, GetTournamentsTournamentIdOrSlugTeamsResponse400, GetTournamentsTournamentIdOrSlugTeamsResponse401, GetTournamentsTournamentIdOrSlugTeamsResponse403, GetTournamentsTournamentIdOrSlugTeamsResponse404, GetTournamentsTournamentIdOrSlugTeamsResponse422, GetTournamentsUpcomingMetadataParam, GetTournamentsUpcomingResponse200, GetTournamentsUpcomingResponse400, GetTournamentsUpcomingResponse401, GetTournamentsUpcomingResponse403, GetTournamentsUpcomingResponse404, GetTournamentsUpcomingResponse422, GetVideogamesMetadataParam, GetVideogamesResponse200, GetVideogamesResponse400, GetVideogamesResponse401, GetVideogamesResponse403, GetVideogamesResponse404, GetVideogamesResponse422, GetVideogamesVideogameIdOrSlugLeaguesMetadataParam, GetVideogamesVideogameIdOrSlugLeaguesResponse200, GetVideogamesVideogameIdOrSlugLeaguesResponse400, GetVideogamesVideogameIdOrSlugLeaguesResponse401, GetVideogamesVideogameIdOrSlugLeaguesResponse403, GetVideogamesVideogameIdOrSlugLeaguesResponse404, GetVideogamesVideogameIdOrSlugLeaguesResponse422, GetVideogamesVideogameIdOrSlugMetadataParam, GetVideogamesVideogameIdOrSlugResponse200, GetVideogamesVideogameIdOrSlugResponse400, GetVideogamesVideogameIdOrSlugResponse401, GetVideogamesVideogameIdOrSlugResponse403, GetVideogamesVideogameIdOrSlugResponse404, GetVideogamesVideogameIdOrSlugResponse422, GetVideogamesVideogameIdOrSlugSeriesMetadataParam, GetVideogamesVideogameIdOrSlugSeriesResponse200, GetVideogamesVideogameIdOrSlugSeriesResponse400, GetVideogamesVideogameIdOrSlugSeriesResponse401, GetVideogamesVideogameIdOrSlugSeriesResponse403, GetVideogamesVideogameIdOrSlugSeriesResponse404, GetVideogamesVideogameIdOrSlugSeriesResponse422, GetVideogamesVideogameIdOrSlugTitlesMetadataParam, GetVideogamesVideogameIdOrSlugTitlesResponse200, GetVideogamesVideogameIdOrSlugTitlesResponse400, GetVideogamesVideogameIdOrSlugTitlesResponse401, GetVideogamesVideogameIdOrSlugTitlesResponse403, GetVideogamesVideogameIdOrSlugTitlesResponse404, GetVideogamesVideogameIdOrSlugTitlesResponse422, GetVideogamesVideogameIdOrSlugTournamentsMetadataParam, GetVideogamesVideogameIdOrSlugTournamentsResponse200, GetVideogamesVideogameIdOrSlugTournamentsResponse400, GetVideogamesVideogameIdOrSlugTournamentsResponse401, GetVideogamesVideogameIdOrSlugTournamentsResponse403, GetVideogamesVideogameIdOrSlugTournamentsResponse404, GetVideogamesVideogameIdOrSlugTournamentsResponse422, GetVideogamesVideogameIdOrSlugVersionsMetadataParam, GetVideogamesVideogameIdOrSlugVersionsResponse200, GetVideogamesVideogameIdOrSlugVersionsResponse400, GetVideogamesVideogameIdOrSlugVersionsResponse401, GetVideogamesVideogameIdOrSlugVersionsResponse403, GetVideogamesVideogameIdOrSlugVersionsResponse404, GetVideogamesVideogameIdOrSlugVersionsResponse422 } from './types';
