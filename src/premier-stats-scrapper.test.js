const PremierAPIService = require('./premier-api.service');
const ExporterService = require('./exporter.service');
const {mapStats, exportStats} = require('./premier-stats-scrapper');

jest.mock('./exporter.service');
jest.mock('./premier-api.service');

const PELE = {nationality: 'Brazil', name: 'Pelé', rank: 1, goals: 1282};
const VITOR_FEIJAO = {nationality: 'Brazil', name: 'Vitor Feijão', rank: 1500, goals: 0};
const MARADONA = {nationality: 'Argentina', name: 'Maradona', rank: 2, goals: 365};
const AGUERO = {nationality: 'Argentina', name: 'Sergio Agüero', rank: 4, goals: 180};

describe('Premier Stats Scrapper', () => {

  describe('exportStats', () => {

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Should return an error when PremierAPIService.getPlayersStats return error', async () => {
      PremierAPIService.getPlayersStats.mockResolvedValue({ err: 'Error hapened!'});
      let result = await exportStats();
      expect(PremierAPIService.getPlayersStats).toHaveBeenCalledTimes(1);
      expect(result.err).toBe('Error hapened!');
    });

    it('Should return an error when PremierAPIService.getPlayersStats return empty results', async () => {
      PremierAPIService.getPlayersStats.mockResolvedValue([]);
      let result = await exportStats();
      expect(PremierAPIService.getPlayersStats).toHaveBeenCalledTimes(1);
      expect(result.err).toBe('Nothing to export!');
    });

    it('Should return an error when ExporterService.exportStatsToXLSX return error', async () => {
      PremierAPIService.getPlayersStats.mockResolvedValue([PELE]);
      ExporterService.exportStatsToXLSX.mockReturnValue({ err: 'Error hapened!' });
      let result = await exportStats();
      expect(PremierAPIService.getPlayersStats).toHaveBeenCalledTimes(1);
      expect(ExporterService.exportStatsToXLSX).toHaveBeenCalledTimes(1);
      expect(result.err).toBe('Error hapened!');
    });

    it('Should call ExporterService.exportStatsToXLSX with correct parameters for correct results', async () => {
      let playerStats = [PELE];
      let nationalitiesStats = [{
        name: "Brazil",
        bestPlayerRank: 1,
        worstPlayerRank: 1,
        bestPlayerGoals: 1282,
        worstPlayerGoals: 1282,
        totalPlayers: 1,
        totalGoals: 1282
      }];


      PremierAPIService.getPlayersStats.mockResolvedValue(playerStats);
      ExporterService.exportStatsToXLSX.mockReturnValue('OK');
      let result = await exportStats();
      expect(result).toBe('OK');
      expect(PremierAPIService.getPlayersStats).toHaveBeenCalledTimes(1);
      expect(ExporterService.exportStatsToXLSX.mock.calls[0][0]).toEqual(playerStats);
      expect(ExporterService.exportStatsToXLSX.mock.calls[0][1]).toEqual(nationalitiesStats);

      unsortedPlayerStats = [VITOR_FEIJAO, PELE];
      playerStats = [PELE, VITOR_FEIJAO];
      nationalitiesStats = [{
        name: "Brazil",
        bestPlayerRank: 1,
        worstPlayerRank: 1500,
        bestPlayerGoals: 1282,
        worstPlayerGoals: 0,
        totalPlayers: 2,
        totalGoals: 1282
      }];


      PremierAPIService.getPlayersStats.mockResolvedValue(unsortedPlayerStats);
      ExporterService.exportStatsToXLSX.mockReturnValue('OK');
      result = await exportStats();
      expect(result).toBe('OK');
      expect(PremierAPIService.getPlayersStats).toHaveBeenCalledTimes(2);
      expect(ExporterService.exportStatsToXLSX.mock.calls[1][0]).toEqual(playerStats);
      expect(ExporterService.exportStatsToXLSX.mock.calls[1][1]).toEqual(nationalitiesStats);

      unsortedPlayerStats = [AGUERO, VITOR_FEIJAO, PELE, MARADONA];
      playerStats = [PELE, MARADONA, AGUERO, VITOR_FEIJAO];
      nationalitiesStats = [{
        name: "Argentina",
        bestPlayerRank: 2,
        worstPlayerRank: 4,
        bestPlayerGoals: 365,
        worstPlayerGoals: 180,
        totalPlayers: 2,
        totalGoals: 545
      } , {
        name: "Brazil",
        bestPlayerRank: 1,
        worstPlayerRank: 1500,
        bestPlayerGoals: 1282,
        worstPlayerGoals: 0,
        totalPlayers: 2,
        totalGoals: 1282
      }];


      PremierAPIService.getPlayersStats.mockResolvedValue(unsortedPlayerStats);
      ExporterService.exportStatsToXLSX.mockReturnValue('OK');
      result = await exportStats();
      expect(result).toBe('OK');
      expect(PremierAPIService.getPlayersStats).toHaveBeenCalledTimes(3);
      expect(ExporterService.exportStatsToXLSX.mock.calls[2][0]).toEqual(playerStats);
      expect(ExporterService.exportStatsToXLSX.mock.calls[2][1]).toEqual(nationalitiesStats);
      
    });

  });

  describe('mapStats', () => {

    it('Should return a empty map for empty parameters', () => {
      const result = mapStats();
      expect(result).toMatchObject({});
    });

    it('Should return the same map if the object has no nationality', () => {
      const map = {"Test": {}};
      const result = mapStats(map, {rank: 1, goals: 2});
      expect(result).toMatchObject(map);
    });

    it('Should return the correct map for emtpy map and a correct object', () => {
      const map = {"Brazil": {
        name: "Brazil",
        bestPlayerRank: 1,
        worstPlayerRank: 1,
        bestPlayerGoals: 1282,
        worstPlayerGoals: 1282,
        totalPlayers: 1,
        totalGoals: 1282
      }};
      const result = mapStats({}, PELE);
      expect(result).toMatchObject(map);
    });

    it('Should return the correct map for existing map and a correct object', () => {
      const map = {
        "Brazil": {
          name: "Brazil",
          bestPlayerRank: 80,
          worstPlayerRank: 120,
          bestPlayerGoals: 200,
          worstPlayerGoals: 10,
          totalPlayers: 5,
          totalGoals: 500
        }
      };

      const map2 = {
        "Brazil": {
          name: "Brazil",
          bestPlayerRank: 80,
          worstPlayerRank: 1500,
          bestPlayerGoals: 200,
          worstPlayerGoals: 0,
          totalPlayers: 6,
          totalGoals: 500
        }
      };

      const map3 = {
        "Brazil": {
          name: "Brazil",
          bestPlayerRank: 1,
          worstPlayerRank: 1500,
          bestPlayerGoals: 1282,
          worstPlayerGoals: 0,
          totalPlayers: 7,
          totalGoals: 1782
        }
      };
      let result = mapStats(map, VITOR_FEIJAO);
      expect(result).toMatchObject(map2);

      result = mapStats(map2, PELE);
      expect(result).toMatchObject(map3);
    });

  });
});