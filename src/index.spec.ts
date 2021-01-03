describe('Library exports', () => {
  it('Browser exports', async () => {
    const exports = await import('./index.browser');

    expect(exports.transport).toBeDefined();
    expect(exports.xhrAdapter).toBeDefined();
    expect(exports.fetchAdapter).toBeDefined();
    expect(exports.createTransport).toBeDefined();
    expect(exports.httpMethods).toBeDefined();
  });

  it('Node exports', async () => {
    const exports = await import('./index.node');

    expect(exports.transport).toBeDefined();
    expect(exports.nodeAdapter).toBeDefined();
    expect(exports.xhrAdapter).toBeDefined();
    expect(exports.fetchAdapter).toBeDefined();
    expect(exports.fakeAdapter).toBeDefined();
    expect(exports.createTransport).toBeDefined();
    expect(exports.httpMethods).toBeDefined();
  });
});
