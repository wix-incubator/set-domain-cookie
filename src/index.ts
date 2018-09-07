const epoch = new Date(0).toUTCString();

function calcSubstrings(str, separator, prefix) {
  const result = [];
  const parts = str.split(separator);
  while (parts.length > 0) {
    result.push(parts.join(separator) || separator);
    if (prefix) {
      parts.pop();
    } else {
      parts.shift();
    }
  }
  return result;
}

export function calcDomainCookie(location, name, value, expires): string[] {
  let domains = calcSubstrings(location.hostname, '.', false);
  const paths = calcSubstrings(location.pathname, '/', true);
  const result = [];
  if (domains.pop() !== 'com') {
    domains = [location.hostname];
  }

  const host = domains[domains.length - 1];
  domains.forEach(domain => {
    paths.forEach(path => {
      if (domain === host && path === '/') {
        result.push(
          `${name}=${value};domain=${domain};path=${path};expires=${expires.toUTCString()}`,
        );
      } else {
        result.push(`${name}=;domain=${domain};path=${path};expires=${epoch}`);
      }
    });
  });
  return result;
}

export default function setDomainCookie(name, value, expires) {
  calcDomainCookie(window.location, name, value, expires).forEach(cookie => {
    document.cookie = cookie;
  });
}
