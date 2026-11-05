import { useEffect } from 'react';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { parseItemDeepLink } from '../utils/deepLink';

export function useDeepLinkController(): void {
  const linkingUrl = Linking.useURL();

  useEffect(() => {
    const itemLink = parseItemDeepLink(linkingUrl);
    if (!itemLink) return;

    router.replace({
      pathname: '/item/[id]',
      params: { id: itemLink.itemId },
    });
  }, [linkingUrl]);
}
