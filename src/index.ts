export interface Config<P, R, V> {
  // 是否可以继续拉取
  hasMore: (res?: R, params?: Partial<P>) => boolean;

  // 获取下一次请求的参数
  getParams: (res?: R, time?: number) => Partial<P>;

  // 数据适配
  dataAdaptor: (res: R) => V[];

  maxCount?: number;
}

// 提取 Promise 泛型
type UnPromise<T> = T extends Promise<infer U> ? U : undefined;

// 分页无限请求
export default async <
  T extends (params: any) => Promise<any>,
  U extends UnPromise<ReturnType<T>>,
  V extends any
>(
  api: T,
  config: Config<Parameters<T>[0], U, V>
): Promise<V[]> => {
  const { hasMore, getParams, dataAdaptor, maxCount = 99 } = config;

  async function iterator(time: number = 0, lastRes?: U): Promise<V[]> {
    // 避免出现死循环，超过次数之后报错
    if (time > maxCount) {
      throw new Error("Reach max iterator times");
    }

    const params = getParams(lastRes, time);
    const res = await api(params);

    let next: V[] = [];

    // 如果还有下一页，继续拉取
    if (hasMore(res, params)) {
      next = await iterator(time + 1, res);
    }

    // 拼接结果一起返回
    return dataAdaptor(res).concat(next);
  }

  return iterator();
};
