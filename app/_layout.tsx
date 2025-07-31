import { Stack } from 'expo-router';
import '../i18n';

export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
 /*
const { t } = useTranslation();
<Text>{t('chooseLanguage')}</Text>
 */