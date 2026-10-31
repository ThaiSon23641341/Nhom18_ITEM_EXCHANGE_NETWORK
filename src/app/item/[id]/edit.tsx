import { useLocalSearchParams } from 'expo-router';
import { ItemFormScreen } from '../../../views/screens/ItemFormScreen';

export default function ItemEditRoute() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const itemId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <ItemFormScreen mode="edit" itemId={itemId} />;
}
