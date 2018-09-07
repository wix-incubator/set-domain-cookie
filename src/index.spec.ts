import { expect } from 'chai';
import setTLDCookie, { calcTLDCookie } from './index';
import { JSDOM, CookieJar } from 'jsdom';

declare var global: Global;
interface Global {
  window: any;
  document: any;
}

describe('Set TLD Cookie', () => {
  describe('calcTLDCookie', () => {
    it('should remove cookies in higher level domains and paths', () => {
      expect(
        calcTLDCookie(
          { hostname: 'www.wix.com', pathname: '/account/sites' },
          'aaa',
          'bbb',
          new Date('1981-12-27T00:00:00Z'),
        ),
      ).to.eql([
        'aaa=;domain=www.wix.com;path=/account/sites;expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'aaa=;domain=www.wix.com;path=/account;expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'aaa=;domain=www.wix.com;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'aaa=;domain=wix.com;path=/account/sites;expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'aaa=;domain=wix.com;path=/account;expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'aaa=bbb;domain=wix.com;path=/;expires=Sun, 27 Dec 1981 00:00:00 GMT',
      ]);
    });

    it('should remove cookies only for paths if not .com', () => {
      expect(
        calcTLDCookie(
          { hostname: 'www.wix.co.il', pathname: '/account/sites' },
          'aaa',
          'bbb',
          new Date('1981-12-27T00:00:00Z'),
        ),
      ).to.eql([
        'aaa=;domain=www.wix.co.il;path=/account/sites;expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'aaa=;domain=www.wix.co.il;path=/account;expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'aaa=bbb;domain=www.wix.co.il;path=/;expires=Sun, 27 Dec 1981 00:00:00 GMT',
      ]);
    });
  });

  describe('setTLDCookie', () => {
    it('removes cookies with too specific domain/path', () => {
      const cookieJar = new CookieJar();
      cookieJar.setCookieSync(
        'aaa=bbb; Expires=Sun, 27 Dec 1981 00:00:00 GMT; Domain=www.wix.com; Path=/',
        'https://www.wix.com/account/sites',
      );
      cookieJar.setCookieSync(
        'aaa=bbb; Expires=Sun, 27 Dec 1981 00:00:00 GMT; Domain=wix.com; Path=/account',
        'https://www.wix.com/account/sites',
      );

      const dom = new JSDOM(``, {
        cookieJar,
        url: 'https://www.wix.com/account/sites',
      });
      global.window = dom.window;
      global.document = window.document;

      setTLDCookie('aaa', 'bbb', new Date('1981-12-27T00:00:00Z'));
      const cookies = cookieJar
        .getCookiesSync('https://www.wix.com/account/sites', {
          now: new Date('1980-01-01T00:00:00Z'),
        })
        .map(x => x.toString());
      expect(cookies).to.eql([
        'aaa=bbb; Expires=Sun, 27 Dec 1981 00:00:00 GMT; Domain=wix.com; Path=/',
      ]);
    });
  });
});
