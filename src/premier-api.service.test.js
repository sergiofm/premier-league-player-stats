const request = require('./request.service');
const {BASE_URL, HEADERS, getApiResults, flattenResult, getPlayersStats} = require('./premier-api.service');

const mockedCatch = {
  catch: jest.fn((cb) => cb())
};

const mockedSet = {
  set: jest.fn(() => mockedCatch)
};

jest.mock('./request.service');

describe('Premier API Service', () => {

  describe('getPlayersStats', () => {

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Should return an error when super agent throws', async () => {
      request.get.mockRejectedValue(new Error('Error hapened!'));
      let result = await getPlayersStats();
      expect(request.get).toHaveBeenCalledTimes(1);
      expect(result.err).toBeDefined();
      expect(result.err.message).toBe('Error hapened!');
    });

    it('Should return an error for invalid result', async () => {
      request.get.mockResolvedValue({});
      let result = await getPlayersStats();
      expect(request.get).toHaveBeenCalledTimes(1);
      expect(result.err).toBe('Invalid API result');

      request.get.mockResolvedValue({body: {}});
      result = await getPlayersStats();
      expect(request.get).toHaveBeenCalledTimes(2);
      expect(result.err).toBe('Invalid API result');

      request.get.mockResolvedValue({body: {stats: {}}});
      result = await getPlayersStats();
      expect(request.get).toHaveBeenCalledTimes(3);
      expect(result.err).toBe('Invalid API result');

      request.get.mockResolvedValue({body: {stats: {pageInfo: {}}}});
      result = await getPlayersStats();
      expect(request.get).toHaveBeenCalledTimes(4);
      expect(result.err).toBe('Invalid API result');

      request.get.mockResolvedValue({body: {stats: {content: []}}});
      result = await getPlayersStats();
      expect(request.get).toHaveBeenCalledTimes(5);
      expect(result.err).toBe('Invalid API result');
      
    });

    it('Should return empty contents when the results dont match flatten pattern', async () => {
      const content = ["Yay!"];
      const requestResult = {body: {stats: {pageInfo: {numPages: 0}, content}}};
      request.get.mockResolvedValue(requestResult);
      let result = await getPlayersStats();
      expect(request.get.mock.calls.length).toBe(1);
      expect(request.get).toHaveBeenNthCalledWith(1, BASE_URL + 0, HEADERS);
      expect(result.err).toBeUndefined();
      expect(result).toEqual([]);

      content.push({});
      request.get.mockResolvedValue(requestResult);
      result = await getPlayersStats();
      expect(request.get.mock.calls.length).toBe(2);
      expect(request.get).toHaveBeenNthCalledWith(2, BASE_URL + 0, HEADERS);
      expect(result.err).toBeUndefined();
      expect(result).toEqual([]);

      content.push({owner: {}});
      request.get.mockResolvedValue(requestResult);
      result = await getPlayersStats();
      expect(request.get.mock.calls.length).toBe(3);
      expect(request.get).toHaveBeenNthCalledWith(3, BASE_URL + 0, HEADERS);
      expect(result.err).toBeUndefined();
      expect(result).toEqual([]);

    });

    
    it('Should return the flatten content for only one page when pageInfo.numPages <= 1', async () => {
      const content = [{
        owner: {
          birth: {
            country: {
              country: 'Brazil'
            }
          },
          name: {
            display: 'Pelé'
          }
        },
        rank: 1,
        value: 1000
      }];
      const flattenContent = [{
        name: 'Pelé',
        nationality: 'Brazil',
        rank: 1,
        goals: 1000
      }];
      request.get.mockResolvedValue({body: {stats: {pageInfo: {numPages: 0}, content}}});
      let result = await getPlayersStats();
      expect(request.get.mock.calls.length).toBe(1);
      expect(request.get).toHaveBeenNthCalledWith(1, BASE_URL + 0, HEADERS);
      expect(result.err).toBeUndefined();
      expect(result).toEqual(flattenContent);

      request.get.mockResolvedValue({body: {stats: {pageInfo: {numPages: 1}, content}}});
      result = await getPlayersStats();
      expect(request.get.mock.calls.length).toBe(2);
      expect(request.get).toHaveBeenNthCalledWith(2, BASE_URL + 0, HEADERS);
      expect(result.err).toBeUndefined();
      expect(result).toEqual(flattenContent);
    });

    it('Should return the concatenated contents for all pages when pageInfo.numPages > 1', async () => {
      const content1 = [{
        owner: {
          birth: {
            country: {
              country: 'Brazil'
            }
          },
          name: {
            display: 'Pelé'
          }
        },
        rank: 1,
        value: 1282
      }];
      const content2 = [{
        owner: {
          birth: {
            country: {
              country: 'Brazil'
            }
          },
          name: {
            display: 'Vitor Feijão'
          }
        }
      }];
      const content3 = [{
        owner: {
          birth: {
            country: {
              country: 'Argentina'
            }
          },
          name: {
            display: 'Maradona'
          }
        },
        rank: 2,
        value: 365
      }];
      const flattenContent1 = [{
        name: 'Pelé',
        nationality: 'Brazil',
        rank: 1,
        goals: 1282
      }];
      const flattenContent2 = [{
        name: 'Vitor Feijão',
        nationality: 'Brazil',
        rank: 0,
        goals: 0
      }];
      const flattenContent3 = [{
        name: 'Maradona',
        nationality: 'Argentina',
        rank: 2,
        goals: 365
      }];
      request.get.mockResolvedValueOnce({body: {stats: {pageInfo: {numPages: 2}, content: content1}}})
        .mockResolvedValueOnce({body: {stats: {pageInfo: {numPages: 2}, content: content2}}});
      let result = await getPlayersStats();
      expect(request.get.mock.calls.length).toBe(2);
      expect(request.get).toHaveBeenNthCalledWith(1, BASE_URL + 0, HEADERS);
      expect(request.get).toHaveBeenNthCalledWith(2, BASE_URL + 1, HEADERS);
      expect(result.err).toBeUndefined();
      expect(result).toEqual([...flattenContent1, ...flattenContent2]);

      
      request.get.mockResolvedValueOnce({body: {stats: {pageInfo: {numPages: 3}, content: content1}}})
        .mockResolvedValueOnce({body: {stats: {pageInfo: {numPages: 3}, content: content2}}})
        .mockResolvedValueOnce({body: {stats: {pageInfo: {numPages: 3}, content: content3}}});
      result = await getPlayersStats();
      expect(request.get.mock.calls.length).toBe(5);
      expect(request.get).toHaveBeenNthCalledWith(3, BASE_URL + 0, HEADERS);
      expect(request.get).toHaveBeenNthCalledWith(4, BASE_URL + 1, HEADERS);
      expect(request.get).toHaveBeenNthCalledWith(5, BASE_URL + 2, HEADERS);
      expect(result.err).toBeUndefined();
      expect(result).toEqual([...flattenContent1, ...flattenContent2, ...flattenContent3]);

    });

  });

  describe('getApiResults', () => {

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Should return an error when super agent throws', async () => {
      request.get.mockRejectedValue(new Error('Error hapened!'));
      let result = await getApiResults();
      expect(request.get).toHaveBeenCalledTimes(1);
      expect(result.err).toBeDefined();
      expect(result.err.message).toBe('Error hapened!');
    });

    it('Should return an error for invalid result', async () => {
      request.get.mockResolvedValue({});
      let result = await getApiResults();
      expect(request.get).toHaveBeenCalledTimes(1);
      expect(result.err).toBe('Invalid API result');

      request.get.mockResolvedValue({body: {}});
      result = await getApiResults();
      expect(request.get).toHaveBeenCalledTimes(2);
      expect(result.err).toBe('Invalid API result');

      request.get.mockResolvedValue({body: {stats: {}}});
      result = await getApiResults();
      expect(request.get).toHaveBeenCalledTimes(3);
      expect(result.err).toBe('Invalid API result');

      request.get.mockResolvedValue({body: {stats: {pageInfo: {}}}});
      result = await getApiResults();
      expect(request.get).toHaveBeenCalledTimes(4);
      expect(result.err).toBe('Invalid API result');

      request.get.mockResolvedValue({body: {stats: {content: []}}});
      result = await getApiResults();
      expect(request.get).toHaveBeenCalledTimes(5);
      expect(result.err).toBe('Invalid API result');
      
    });

    
    it('Should return the content for only one page when pageInfo.numPages <= 1', async () => {
      const content = ["Yay!"];
      request.get.mockResolvedValue({body: {stats: {pageInfo: {numPages: 0}, content}}});
      let result = await getApiResults();
      expect(request.get.mock.calls.length).toBe(1);
      expect(request.get).toHaveBeenNthCalledWith(1, BASE_URL + 0, HEADERS);
      expect(result.err).toBeUndefined();
      expect(result).toEqual(content);

      request.get.mockResolvedValue({body: {stats: {pageInfo: {numPages: 1}, content}}});
      result = await getApiResults();
      expect(request.get.mock.calls.length).toBe(2);
      expect(request.get).toHaveBeenNthCalledWith(2, BASE_URL + 0, HEADERS);
      expect(result.err).toBeUndefined();
      expect(result).toEqual(content);
    });

    it('Should return the concatenated contents for all pages when pageInfo.numPages > 1', async () => {
      const content1 = ["Page 1!"];
      const content2 = ["Page 2!"];
      const content3 = ["Page 3!"];
      request.get.mockResolvedValueOnce({body: {stats: {pageInfo: {numPages: 2}, content: content1}}})
        .mockResolvedValueOnce({body: {stats: {pageInfo: {numPages: 2}, content: content2}}});
      let result = await getApiResults();
      expect(request.get.mock.calls.length).toBe(2);
      expect(request.get).toHaveBeenNthCalledWith(1, BASE_URL + 0, HEADERS);
      expect(request.get).toHaveBeenNthCalledWith(2, BASE_URL + 1, HEADERS);
      expect(result.err).toBeUndefined();
      expect(result).toEqual([...content1, ...content2]);

      
      request.get.mockResolvedValueOnce({body: {stats: {pageInfo: {numPages: 3}, content: content1}}})
        .mockResolvedValueOnce({body: {stats: {pageInfo: {numPages: 3}, content: content2}}})
        .mockResolvedValueOnce({body: {stats: {pageInfo: {numPages: 3}, content: content3}}});
      result = await getApiResults();
      expect(request.get.mock.calls.length).toBe(5);
      expect(request.get).toHaveBeenNthCalledWith(3, BASE_URL + 0, HEADERS);
      expect(request.get).toHaveBeenNthCalledWith(4, BASE_URL + 1, HEADERS);
      expect(request.get).toHaveBeenNthCalledWith(5, BASE_URL + 2, HEADERS);
      expect(result.err).toBeUndefined();
      expect(result).toEqual([...content1, ...content2, ...content3]);

    });

  });

  describe('flattenResult', () => {

    it('Should return an error for Invalid result', () => {
      let result = flattenResult({});
      expect(result.err).toBe('Invalid result');

      result = flattenResult({rank: 1, value: 1});
      expect(result.err).toBe('Invalid result');

      result = flattenResult({owner: {}, rank: 1, value: 1});
      expect(result.err).toBe('Invalid result');

      result = flattenResult({owner: { name: {} }, rank: 1, value: 1});
      expect(result.err).toBe('Invalid result');

      result = flattenResult({owner: { name: {}, birth: {} }, rank: 1, value: 1});
      expect(result.err).toBe('Invalid result');

      result = flattenResult({owner: { birth: {} }, rank: 1, value: 1});
      expect(result.err).toBe('Invalid result');

      result = flattenResult({owner: { birth: { country: {}} }, rank: 1, value: 1});
      expect(result.err).toBe('Invalid result');
    });

    it('Should return the correct flatten result', () => {
      let result = flattenResult({owner: { name: { display: "Pelé" }, birth: { country: { country: "Brazil"}} }, rank: 1, value: 1282});
      expect(result.err).toBeUndefined();
      expect(result.name).toBe('Pelé');
      expect(result.nationality).toBe('Brazil');
      expect(result.rank).toBe(1);
      expect(result.goals).toBe(1282);

      result = flattenResult({owner: { name: { display: "Vitor Feijão" }, birth: { country: { country: "Brazil"}} }});
      expect(result.err).toBeUndefined();
      expect(result.name).toBe('Vitor Feijão');
      expect(result.nationality).toBe('Brazil');
      expect(result.rank).toBe(0);
      expect(result.goals).toBe(0);
    });

  });
});