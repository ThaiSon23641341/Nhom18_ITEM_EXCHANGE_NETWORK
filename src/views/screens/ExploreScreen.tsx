import { BookOpen, ChevronDown, Coffee, Filter, Grid2X2, Pencil, Search, Shirt, SlidersHorizontal } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, Text as NativeText, View } from 'react-native';
import { Button, Input, ScrollView, Text, XStack, YStack } from 'tamagui';
import { useExploreController } from '../../controllers/useExploreController';
import { ProductCard, type ProductCardProps } from '../components/ProductCard';

type SortOption = 'newest' | 'price-low' | 'price-high';
type PriceFilter = 'all' | 'free' | 'paid';

const CATEGORIES = [
  { label: 'Tất cả', icon: Grid2X2 },
  { label: 'Sách', icon: BookOpen },
  { label: 'Giáo trình', icon: BookOpen },
  { label: 'Đồ gia dụng', icon: Coffee },
  { label: 'Học tập', icon: Pencil },
  { label: 'Dụng cụ học tập', icon: Pencil },
  { label: 'Thời trang', icon: Shirt },
  { label: 'Thiết bị điện tử', icon: SlidersHorizontal },
  { label: 'Phụ kiện', icon: SlidersHorizontal },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Giá thấp đến cao', value: 'price-low' },
  { label: 'Giá cao đến thấp', value: 'price-high' },
];

export function ExploreScreen() {
  const { items, isLoading, loadError, retry } = useExploreController();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [draftAvailableOnly, setDraftAvailableOnly] = useState(false);
  const [draftPriceFilter, setDraftPriceFilter] = useState<PriceFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const products = useMemo<ProductCardProps[]>(() => items.map((item) => ({
    itemId: item.id,
    title: item.title,
    category: item.category,
    location: item.location ?? 'Trong khuôn viên IUH',
    distance: item.distance ?? '',
    price: item.priceVnd === undefined
      ? 'Trao đổi'
      : item.priceVnd === 0
        ? 'Miễn phí'
        : `${new Intl.NumberFormat('vi-VN').format(item.priceVnd)}đ`,
    ownerName: item.ownerName ?? 'Sinh viên IUH',
    faculty: item.ownerFaculty ? `Khoa: ${item.ownerFaculty}` : 'Sinh viên IUH',
    imageUrl: item.imageUrls?.[0] ?? item.imageUrl,
    available: item.status === 'available',
    createdAt: item.createdAt,
    priceVnd: item.priceVnd,
  })), [items]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const matchingProducts = products.filter((product) => {
      const matchesSearch = !query || [
        product.title,
        product.category,
        product.location,
        product.ownerName,
      ].some((value) => value.toLocaleLowerCase().includes(query));
      const matchesCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
      const matchesAvailability = !availableOnly || product.available !== false;
      const isFree = product.priceVnd === 0;
      const matchesPrice = priceFilter === 'all'
        || (priceFilter === 'free' && isFree)
        || (priceFilter === 'paid' && !isFree);

      return matchesSearch && matchesCategory && matchesAvailability && matchesPrice;
    });

    if (sortOption === 'newest') {
      return matchingProducts.sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      );
    }

    return matchingProducts.sort((a, b) => {
      if (a.priceVnd === undefined) return 1;
      if (b.priceVnd === undefined) return -1;
      const priceA = a.priceVnd;
      const priceB = b.priceVnd;
      return sortOption === 'price-low' ? priceA - priceB : priceB - priceA;
    });
  }, [availableOnly, priceFilter, products, search, selectedCategory, sortOption]);

  const openFilters = () => {
    setDraftAvailableOnly(availableOnly);
    setDraftPriceFilter(priceFilter);
    setFilterVisible(true);
  };

  const sortLabel = SORT_OPTIONS.find((option) => option.value === sortOption)?.label ?? 'Mới nhất';

  return (
    <YStack flex={1} backgroundColor="background">
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack px="4" pt="3" pb="4" gap="3">
          <YStack gap="1">
            <Text color="secondary" fontSize="6" fontWeight="800">Khám phá đồ dùng</Text>
            <Text color="color" opacity={0.65} fontSize="2">Tìm kiếm, trao đổi, chia sẻ - Cùng nhau sống xanh tại IUH</Text>
          </YStack>

          <XStack items="center" h={46} borderWidth={1} borderColor="border-color" rounded="10" backgroundColor="background" px="3" gap="2">
            <Search size={20} color="#6B7280" />
            <Input
              flex={1}
              h="100%"
              borderWidth={0}
              backgroundColor="transparent"
              px="0"
              fontSize="3"
              placeholder="Tìm sách, đồ gia dụng..."
              aria-label="Tìm kiếm đồ dùng"
              value={search}
              onChangeText={setSearch}
            />
            <Button w={36} h={36} circular backgroundColor="transparent" borderWidth={0} aria-label="Mở tùy chọn tìm kiếm" onPress={openFilters}>
              <SlidersHorizontal size={19} color="#16815D" />
            </Button>
          </XStack>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="2">
              {CATEGORIES.map(({ label, icon: Icon }) => {
                const isSelected = selectedCategory === label;
                return (
                <Button
                  key={label}
                  h={38}
                  rounded="10"
                  px="3"
                  gap="2"
                  backgroundColor={isSelected ? 'primary' : 'background'}
                  borderWidth={isSelected ? 0 : 1}
                  borderColor="border-color"
                  aria-label={`Danh mục ${label}${isSelected ? ', đang chọn' : ''}`}
                  aria-pressed={isSelected}
                  onPress={() => setSelectedCategory(label)}
                >
                  <Icon size={16} color={isSelected ? '#FFFFFF' : '#145B45'} />
                  <Text color={isSelected ? 'white' : 'color'} fontSize="2" fontWeight={isSelected ? '700' : '500'}>{label}</Text>
                </Button>
                );
              })}
            </XStack>
          </ScrollView>

          <XStack items="center" justify="space-between">
            <Button h={36} rounded="10" backgroundColor="#E8F5EF" borderWidth={0} px="3" gap="2" aria-label="Mở bộ lọc" onPress={openFilters}>
              <Filter size={16} color="#145B45" />
              <Button.Text color="color" fontSize="2">Bộ lọc</Button.Text>
            </Button>
            <Button h={36} rounded="10" backgroundColor="#E8F5EF" borderWidth={0} px="3" gap="2" aria-label={`Sắp xếp: ${sortLabel}`} onPress={() => setSortVisible(true)}>
              <ChevronDown size={15} color="#16815D" />
              <Button.Text color="primary" fontSize="2" fontWeight="600">{sortLabel}</Button.Text>
            </Button>
          </XStack>

          <Text color="color" opacity={0.65} fontSize="2">
            {`Tìm thấy ${filteredProducts.length} đồ dùng`}
          </Text>

          {loadError ? (
            <YStack items="center" gap="3" py="6">
              <Text color="color" text="center">{loadError}</Text>
              <Button onPress={retry} theme="active">Thử lại</Button>
            </YStack>
          ) : isLoading ? (
            <Text color="color" opacity={0.65} text="center" py="6">
              Đang tải danh sách đồ dùng...
            </Text>
          ) : filteredProducts.length > 0 ? (
            <XStack flexWrap="wrap" justify="space-between">
              {filteredProducts.map((product) => <ProductCard key={product.itemId} {...product} />)}
            </XStack>
          ) : (
            <Text color="color" opacity={0.65} text="center" py="6">
              Không tìm thấy đồ dùng phù hợp.
            </Text>
          )}
        </YStack>
      </ScrollView>

      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setFilterVisible(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <NativeText style={styles.sheetTitle}>Bộ lọc</NativeText>
              <Pressable onPress={() => {
                setDraftAvailableOnly(false);
                setDraftPriceFilter('all');
              }}>
                <NativeText style={styles.clearText}>Xóa bộ lọc</NativeText>
              </Pressable>
            </View>
            <NativeText style={styles.sectionTitle}>Tình trạng</NativeText>
            <FilterOption
              label="Chỉ hiện đồ còn hàng"
              selected={draftAvailableOnly}
              onPress={() => setDraftAvailableOnly((current) => !current)}
            />
            <NativeText style={styles.sectionTitle}>Giá</NativeText>
            {([
              ['all', 'Tất cả mức giá'],
              ['free', 'Miễn phí'],
              ['paid', 'Có giá'],
            ] as const).map(([value, label]) => (
              <FilterOption
                key={value}
                label={label}
                selected={draftPriceFilter === value}
                onPress={() => setDraftPriceFilter(value)}
              />
            ))}
            <Button
              mt="4"
              h={48}
              backgroundColor="primary"
              onPress={() => {
                setAvailableOnly(draftAvailableOnly);
                setPriceFilter(draftPriceFilter);
                setFilterVisible(false);
              }}
            >
              <Button.Text color="white" fontWeight="700">Áp dụng</Button.Text>
            </Button>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={sortVisible} transparent animationType="fade" onRequestClose={() => setSortVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setSortVisible(false)}>
          <Pressable style={styles.sortDialog} onPress={(event) => event.stopPropagation()}>
            <NativeText style={styles.sheetTitle}>Sắp xếp theo</NativeText>
            {SORT_OPTIONS.map(({ label, value }) => (
              <FilterOption
                key={value}
                label={label}
                selected={sortOption === value}
                onPress={() => {
                  setSortOption(value);
                  setSortVisible(false);
                }}
              />
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </YStack>
  );
}

function FilterOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.option}
    >
      <NativeText style={styles.optionLabel}>{label}</NativeText>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

const styles = {
  overlay: {
    flex: 1,
    justifyContent: 'flex-end' as const,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    padding: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  sortDialog: {
    margin: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  sheetHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
  },
  sheetTitle: {
    color: '#18332A',
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#18332A',
    fontSize: 15,
    fontWeight: '700' as const,
    marginTop: 8,
    marginBottom: 4,
  },
  clearText: {
    color: '#16815D',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  option: {
    minHeight: 48,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionLabel: {
    color: '#26332E',
    fontSize: 15,
  },
  radio: {
    width: 20,
    height: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 10,
  },
  radioSelected: {
    borderColor: '#16815D',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16815D',
  },
};

export default ExploreScreen;
