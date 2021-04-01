import unpaginate from "../index";

function createMockStores(max: number, { pageSize, pageNum }: any) {
  return Promise.resolve({
    total: max,
    stores: new Array(
      (pageNum + 1) * pageSize > max ? max - pageSize * pageNum : pageSize
    )
      .fill(0)
      .map((item, index) => ({
        id: pageNum * pageSize + index,
      })),
  });
}

const api = {
  getStore10: (params: any) => createMockStores(10, params),
  getStore21: (params: any) => createMockStores(21, params),
};

describe("unpaginate()", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("should unpaginate api service", async () => {
    const spy = jest.spyOn(api, "getStore10");

    const pageSize = 5;
    const result = await unpaginate(api.getStore10, {
      getParams(res, time) {
        return {
          pageSize,
          pageNum: time,
        };
      },
      hasMore(res, params) {
        if (!res) {
          return true;
        }
        return res.stores.length === params?.pageSize;
      },
      dataAdaptor({ stores }) {
        return stores;
      },
    });
    expect(result).toHaveLength(10);
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it("should unpaginate api service", async () => {
    const spy = jest.spyOn(api, "getStore21");

    const pageSize = 5;
    const result = await unpaginate(api.getStore21, {
      getParams(res, time) {
        return {
          pageSize,
          pageNum: time,
        };
      },
      hasMore(res, params) {
        if (!res) {
          return true;
        }
        return res.stores.length === params?.pageSize;
      },
      dataAdaptor({ stores }) {
        return stores;
      },
    });
    expect(result).toHaveLength(21);
    expect(spy).toHaveBeenCalledTimes(5);
  });

  it("should throw error if max iterator count reached", async () => {
    const spy = jest.spyOn(api, "getStore21");

    const pageSize = 1;
    await expect(
      unpaginate(api.getStore21, {
        maxCount: 10,
        getParams(res, time) {
          return {
            pageSize,
            pageNum: time,
          };
        },
        hasMore(res, params) {
          if (!res) {
            return true;
          }
          return res.stores.length === params?.pageSize;
        },
        dataAdaptor({ stores }) {
          return stores;
        },
      })
    ).rejects.toThrowError("Reach max iterator times");
    expect(spy).toHaveBeenCalledTimes(11);
  });
});
