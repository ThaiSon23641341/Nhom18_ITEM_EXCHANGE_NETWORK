import { Image, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  CheckCircle, FileWarning, Filter, LockKeyhole, LogOut, PackageCheck, RefreshCw, Search,
  ShieldAlert, ShieldCheck, Trash2, UserRound, UserX, Users,
} from 'lucide-react-native';
import { Avatar, Button, Input, ScrollView, Separator, Text, useTheme, XStack, YStack } from 'tamagui';
import type { AdminAction, AdminItemFilter, AdminTab } from '../../controllers/useAdminController';
import { useAdminController } from '../../controllers/useAdminController';
import type { ReportReason } from '../../models/reportModel';
import type { User } from '../../models/userModel';

function useAdminColors() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  return {
    background: 'background' as const,
    surface: 'background-hover' as const,
    text: 'color' as const,
    muted: 'color-11' as const,
    subtle: 'color-10' as const,
    border: 'border-color' as const,
    primary: 'primary' as const,
    primaryIcon: theme.primary?.val as string,
    primaryForeground: colorScheme === 'dark' ? '#101827' as const : '#FFFFFF' as const,
    danger: colorScheme === 'dark' ? '#FDA29B' as const : '#B42318' as const,
    dangerSurface: colorScheme === 'dark' ? '#3A1D22' as const : '#FEF3F2' as const,
    warning: colorScheme === 'dark' ? '#FEC84B' as const : '#B54708' as const,
    info: colorScheme === 'dark' ? '#84CAFF' as const : '#175CD3' as const,
    purple: colorScheme === 'dark' ? '#D6BBFB' as const : '#6941C6' as const,
  };
}
const REASONS: Record<ReportReason, string> = {
  suspected_scam: 'Lừa đảo', prohibited_item: 'Hàng cấm',
  misleading_information: 'Thông tin sai lệch', inappropriate_content: 'Nội dung xấu', other: 'Khác',
};
const TABS: { key: AdminTab; label: string }[] = [
  { key: 'reports', label: 'Báo cáo vi phạm' },
  { key: 'items', label: 'Quản lý bài đăng' },
  { key: 'users', label: 'Quản lý sinh viên' },
];
const ITEM_FILTERS: { key: AdminItemFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' }, { key: 'available', label: 'Khả dụng' },
  { key: 'reserved', label: 'Đã đặt' }, { key: 'exchanged', label: 'Đã trao' },
  { key: 'actioned', label: 'Đã xử lý' },
];
const dateLabel = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Không rõ ngày' : date.toLocaleDateString('vi-VN');
};

function Metric({ label, value, icon, tint }: {
  label: string; value: number; icon: React.ReactNode;
  tint: string;
}) {
  const colors = useAdminColors();
  return (
    <YStack flex={1} minW={0} borderWidth={1} borderColor={colors.border} backgroundColor={colors.background} p="3" gap="2">
      <XStack items="center" justify="space-between">
        <XStack w={36} h={36} rounded={12} backgroundColor={colors.surface} items="center" justify="center">{icon}</XStack>
        <Text color={colors.text} fontSize="6" fontWeight="800">{value.toLocaleString('vi-VN')}</Text>
      </XStack>
      <Text color={colors.muted} fontSize="2" fontWeight="600">{label}</Text>
    </YStack>
  );
}

function Picture({ uri, label }: { uri?: string; label: string }) {
  const colors = useAdminColors();
  return (
    <XStack w={72} h={72} rounded={12} overflow="hidden" backgroundColor={colors.surface} items="center" justify="center">
      {uri ? <Image source={{ uri }} accessibilityLabel={label} resizeMode="cover" style={{ width: '100%', height: '100%' }} /> : <PackageCheck size={24} color={colors.muted} />}
    </XStack>
  );
}

function AvatarView({ user }: { user: User }) {
  const colors = useAdminColors();
  return (
    <Avatar circular size={48} backgroundColor={colors.surface}>
      {user.avatarUrl ? <Avatar.Image src={user.avatarUrl} accessibilityLabel={`Ảnh ${user.fullName}`} /> : null}
      <Avatar.Fallback backgroundColor={colors.surface} items="center" justify="center"><UserRound size={20} color={colors.primaryIcon} /></Avatar.Fallback>
    </Avatar>
  );
}

function confirmationFor(action: AdminAction | null) {
  if (!action) return { title: 'Xác nhận thao tác', body: '', submit: 'Xác nhận' };
  switch (action.kind) {
    case 'dismiss-report': return { title: 'Bỏ qua báo cáo?', body: 'Báo cáo sẽ được đánh dấu đã bỏ qua.', submit: 'Bỏ qua' };
    case 'remove-item':
    case 'delete-item': return { title: 'Xóa bài đăng?', body: 'Bài đăng sẽ bị xóa. Thao tác này không thể hoàn tác.', submit: 'Xóa bài đăng' };
    case 'ban-user':
    case 'set-user-status': return { title: 'Cập nhật trạng thái tài khoản?', body: 'Trạng thái khóa sẽ được lưu trên máy chủ và có hiệu lực ngay sau khi xác nhận.', submit: 'Cập nhật' };
    case 'adjust-reputation': return { title: 'Điều chỉnh điểm uy tín?', body: `Điểm uy tín sẽ thay đổi ${action.amount > 0 ? '+' : ''}${action.amount} điểm và được lưu trên máy chủ.`, submit: 'Điều chỉnh' };
    case 'set-item-status': return { title: 'Đổi trạng thái bài đăng?', body: `Bài đăng sẽ chuyển sang trạng thái “${action.status}”.`, submit: 'Cập nhật' };
  }
}

export function AdminScreen() {
  const admin = useAdminController();
  const colors = useAdminColors();
  const confirm = confirmationFor(admin.pendingAction);
  const ask = (action: AdminAction) => admin.setPendingAction(action);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ScrollView flex={1} backgroundColor={colors.background} keyboardShouldPersistTaps="handled">
        <YStack gap="4" py="3">
          <YStack px="4" gap="4">
            <XStack items="center" justify="space-between">
              <YStack gap="1">
              <Text color={colors.text} fontSize="7" fontWeight="800">Quản trị hệ thống</Text>
                <XStack self="flex-start" items="center" gap="1" px="2" py="1" rounded={999} backgroundColor={colors.surface}>
                  <ShieldCheck size={14} color={colors.primaryIcon} /><Text color={colors.primary} fontSize="1" fontWeight="700">ADMIN</Text>
                </XStack>
              </YStack>
              <Button circular backgroundColor={colors.surface} color={colors.primary} borderWidth={1} borderColor={colors.border}
                accessibilityLabel="Làm mới dữ liệu" onPress={() => void admin.refresh()} disabled={admin.isLoading}>
                <RefreshCw size={20} color={colors.primaryIcon} />
              </Button>
            </XStack>
            {admin.adminUser ? (
              <XStack items="center" gap="3" p="3" borderWidth={1} borderColor={colors.border} rounded={14} backgroundColor={colors.background}>
                <AvatarView user={admin.adminUser} />
                <YStack flex={1} gap="1">
                  <Text color={colors.text} fontWeight="700" numberOfLines={1}>{admin.adminUser.fullName}</Text>
                  <Text color={colors.muted} fontSize="2" numberOfLines={1}>{admin.adminUser.email}</Text>
                  <Text color={colors.subtle} fontSize="1">MSSV: {admin.adminUser.studentId} · Quản trị viên</Text>
                </YStack>
                <Button backgroundColor={colors.dangerSurface} color={colors.danger} onPress={() => {
                  admin.logout();
                  router.replace('/login');
                }} accessibilityLabel="Đăng xuất tài khoản quản trị">
                  <LogOut size={16} /> Đăng xuất
                </Button>
              </XStack>
            ) : null}
            <XStack items="center" gap="2" p="3" rounded={14} backgroundColor={colors.surface}>
              {admin.health === 'online' ? <CheckCircle size={17} color={colors.primaryIcon} /> : <ShieldAlert size={17} color={admin.health === 'offline' ? colors.danger : '#98A2B3'} />}
              <Text color={colors.text} fontSize="2" fontWeight="600">Trạng thái máy chủ</Text>
              <XStack flex={1} />
              <Text color={admin.health === 'online' ? colors.primary : admin.health === 'offline' ? colors.danger : colors.subtle} fontSize="2" fontWeight="700">
                {admin.health === 'online' ? 'Đang hoạt động' : admin.health === 'offline' ? 'Không kết nối' : 'Đang kiểm tra'}
              </Text>
            </XStack>
            <YStack gap="2">
              <Text color={colors.text} fontSize="4" fontWeight="700">Thống kê hệ thống</Text>
              <XStack gap="2">
                <Metric label="Tổng sinh viên" value={admin.metrics.students} tint={colors.primaryIcon} icon={<Users size={18} color={colors.primaryIcon} />} />
                <Metric label="Bài đăng khả dụng" value={admin.metrics.availableItems} tint={colors.info} icon={<PackageCheck size={18} color={colors.info} />} />
              </XStack>
              <XStack gap="2">
                <Metric label="Báo cáo chờ duyệt" value={admin.metrics.pendingReports} tint={colors.warning} icon={<FileWarning size={18} color={colors.warning} />} />
                <Metric label="Giao dịch thành công" value={admin.metrics.completedExchanges} tint={colors.purple} icon={<CheckCircle size={18} color={colors.purple} />} />
              </XStack>
            </YStack>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="2">
                {TABS.map((tab) => {
                  const active = admin.activeTab === tab.key;
                  return <Button key={tab.key} rounded={999} backgroundColor={active ? colors.primary : colors.surface} color={active ? colors.primaryForeground : colors.text}
                    onPress={() => { admin.setActiveTab(tab.key); admin.setSearchQuery(''); }}>{tab.label}</Button>;
                })}
              </XStack>
            </ScrollView>
          </YStack>

          {admin.error ? <YStack mx="4" p="3" gap="2" backgroundColor={colors.dangerSurface} rounded={12}>
            <Text color={colors.danger}>{admin.error}</Text>
            <XStack self="flex-start"><Button backgroundColor={colors.primary} color={colors.primaryForeground} onPress={() => void admin.refresh()}>Thử lại</Button></XStack>
          </YStack> : null}
          {admin.actionError ? <Text mx="4" color={colors.danger}>{admin.actionError}</Text> : null}
          {admin.isLoading ? <Text color={colors.muted} text="center">Đang tải dữ liệu quản trị…</Text> : null}

          {admin.activeTab === 'reports' ? (
            <YStack px="4" gap="3" pb="5">
              <Text color={colors.text} fontSize="4" fontWeight="700">Kiểm duyệt báo cáo ({admin.reports.length})</Text>
              {admin.reports.length === 0 && !admin.isLoading ? <Text color={colors.muted} text="center">Không có báo cáo chờ xử lý.</Text> : null}
              {admin.reports.map((report) => (
                <YStack key={report.id} borderWidth={1} borderColor={colors.border} rounded={14} p="3" gap="3" backgroundColor={colors.background}>
                  <XStack gap="3" items="center">
                    <Picture uri={report.item?.imageUrl} label={report.item?.title ?? 'Bài đăng bị báo cáo'} />
                    <YStack flex={1} gap="1">
                      <Text color={colors.text} fontWeight="700" numberOfLines={2}>{report.item?.title ?? `Bài đăng ${report.itemId}`}</Text>
                      <Text color={colors.muted} fontSize="2" numberOfLines={1}>Người báo cáo: {report.reporter?.fullName ?? report.reporterId}</Text>
                      <Text color={colors.subtle} fontSize="1">{dateLabel(report.createdAt)}</Text>
                    </YStack>
                  </XStack>
                  <XStack self="flex-start" backgroundColor={colors.dangerSurface} px="2" py="1" rounded={999}>
                    <Text color={colors.danger} fontSize="1" fontWeight="700">{REASONS[report.reason]}</Text>
                  </XStack>
                  {report.details ? <Text color={colors.text} fontSize="2">{report.details}</Text> : null}
                  <Separator borderColor={colors.border} />
                  <XStack gap="2" flexWrap="wrap">
                    <Button flex={1} minW={100} backgroundColor={colors.surface} color={colors.text}
                      onPress={() => ask({ kind: 'dismiss-report', report })}>Bỏ qua</Button>
                    <Button flex={1} minW={120} variant="outlined" borderColor={colors.danger} color={colors.danger} disabled={!report.item}
                      onPress={() => report.item && ask({ kind: 'remove-item', item: report.item })}><Trash2 size={15} /> Xóa bài đăng</Button>
                    <Button flex={1} minW={120} backgroundColor={colors.danger} color={colors.primaryForeground} disabled={!report.reporter}
                      onPress={() => report.reporter && ask({ kind: 'ban-user', user: report.reporter })}><UserX size={15} /> Khóa tài khoản</Button>
                  </XStack>
                </YStack>
              ))}
            </YStack>
          ) : null}

          {admin.activeTab === 'users' ? (
            <YStack px="4" gap="3" pb="5">
              <Text color={colors.text} fontSize="4" fontWeight="700">Quản lý sinh viên ({admin.users.length})</Text>
              <XStack items="center" gap="2" borderWidth={1} borderColor={colors.border} rounded={12} px="3" backgroundColor={colors.background}>
                <Search size={18} color={colors.muted} /><Input flex={1} borderWidth={0} placeholder="Tìm tên, MSSV hoặc khoa"
                  value={admin.searchQuery} onChangeText={admin.setSearchQuery} accessibilityLabel="Tìm sinh viên" />
              </XStack>
              {admin.users.map((user) => {
                const banned = admin.isBanned(user.id);
                return <YStack key={user.id} borderWidth={1} borderColor={colors.border} rounded={14} p="3" gap="3" backgroundColor={colors.background}>
                  <XStack items="center" gap="3">
                    <AvatarView user={user} />
                    <YStack flex={1} gap="1">
                      <Text color={colors.text} fontWeight="700" numberOfLines={1}>{user.fullName}</Text>
                      <Text color={colors.muted} fontSize="2">MSSV: {user.studentId}</Text>
                      <Text color={colors.muted} fontSize="2" numberOfLines={1}>{user.faculty || 'Chưa cập nhật khoa'}</Text>
                    </YStack>
                    <YStack items="flex-end"><Text color={colors.primary} fontWeight="800">{admin.reputationOf(user)}</Text><Text color={colors.subtle} fontSize="1">Điểm uy tín</Text></YStack>
                  </XStack>
                  <XStack items="center" justify="space-between" gap="2">
                    <Text color={banned ? colors.danger : colors.primary} fontSize="1" fontWeight="700">{banned ? 'Bị khóa' : 'Hoạt động'}</Text>
                    <XStack gap="1">
                      <Button circular accessibilityLabel="Trừ 10 điểm uy tín" onPress={() => ask({ kind: 'adjust-reputation', user, amount: -10 })}>−</Button>
                      <Button circular accessibilityLabel="Cộng 10 điểm uy tín" onPress={() => ask({ kind: 'adjust-reputation', user, amount: 10 })}>+</Button>
                      <Button backgroundColor={banned ? colors.surface : colors.dangerSurface} color={banned ? colors.primary : colors.danger}
                        onPress={() => ask({ kind: 'set-user-status', user })}><LockKeyhole size={14} />{banned ? 'Mở khóa' : 'Khóa'}</Button>
                    </XStack>
                  </XStack>
                </YStack>;
              })}
              {admin.users.length === 0 && !admin.isLoading ? <Text color={colors.muted} text="center">Không tìm thấy sinh viên.</Text> : null}
            </YStack>
          ) : null}

          {admin.activeTab === 'items' ? (
            <YStack px="4" gap="3" pb="5">
              <Text color={colors.text} fontSize="4" fontWeight="700">Quản lý bài đăng ({admin.items.length})</Text>
              <XStack items="center" gap="2" borderWidth={1} borderColor={colors.border} rounded={12} px="3" backgroundColor={colors.background}>
                <Search size={18} color={colors.muted} /><Input flex={1} borderWidth={0} placeholder="Tìm bài đăng hoặc người đăng"
                  value={admin.searchQuery} onChangeText={admin.setSearchQuery} accessibilityLabel="Tìm bài đăng" />
              </XStack>
              <XStack items="center" gap="1"><Filter size={15} color={colors.primaryIcon} /><Text color={colors.muted} fontSize="2">Lọc trạng thái</Text></XStack>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}><XStack gap="2">
                {ITEM_FILTERS.map((filter) => <Button key={filter.key} rounded={999}
                  backgroundColor={admin.itemFilter === filter.key ? colors.primary : colors.surface} color={admin.itemFilter === filter.key ? colors.primaryForeground : colors.text}
                  onPress={() => admin.setItemFilter(filter.key)}>{filter.label}</Button>)}
              </XStack></ScrollView>
              {admin.items.map((item) => <YStack key={item.id} borderWidth={1} borderColor={colors.border} rounded={14} p="3" gap="3" backgroundColor={colors.background}>
                <XStack items="center" gap="3">
                  <Picture uri={item.imageUrl} label={item.title} />
                  <YStack flex={1} gap="1">
                    <Text color={colors.text} fontWeight="700" numberOfLines={2}>{item.title}</Text>
                    <Text color={colors.muted} fontSize="2">{item.ownerName || item.ownerId}</Text>
                    <Text color={colors.subtle} fontSize="1">Trạng thái: {item.status}</Text>
                  </YStack>
                </XStack>
                <XStack gap="2" flexWrap="wrap">
                  {item.status === 'reserved' ? <Button flex={1} onPress={() => ask({ kind: 'set-item-status', item, status: 'available' })}>Mở khả dụng</Button> : null}
                  {item.status === 'available' ? <Button flex={1} onPress={() => ask({ kind: 'set-item-status', item, status: 'reserved' })}>Đặt trước</Button> : null}
                  <Button flex={1} variant="outlined" borderColor={colors.danger} color={colors.danger} disabled={item.status === 'exchanged'}
                    onPress={() => ask({ kind: 'delete-item', item })}><Trash2 size={15} /> Gỡ bài đăng</Button>
                </XStack>
              </YStack>)}
              {admin.items.length === 0 && !admin.isLoading ? <Text color={colors.muted} text="center">Không có bài đăng phù hợp.</Text> : null}
            </YStack>
          ) : null}
        </YStack>
      </ScrollView>
      {admin.pendingAction ? (
        <YStack
          position="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          backgroundColor="rgba(0,0,0,0.45)"
          items="center"
          justify="center"
          px="5"
        >
          <YStack
            w="100%"
            maxW={420}
            p="4"
            gap="3"
            rounded={16}
            borderWidth={1}
            borderColor={colors.border}
            backgroundColor={colors.background}
          >
            <Text color={colors.text} fontSize="5" fontWeight="800">{confirm.title}</Text>
            <Text color={colors.muted} fontSize="3">{confirm.body}</Text>
            <XStack justify="flex-end" gap="2" mt="2">
              <Button onPress={() => admin.setPendingAction(null)}>Hủy</Button>
              <Button backgroundColor={admin.pendingAction.kind === 'remove-item' || admin.pendingAction.kind === 'delete-item' || admin.pendingAction.kind === 'ban-user' ? colors.danger : colors.primary}
                color={colors.primaryForeground} disabled={admin.isActing} onPress={admin.confirmAction}>{admin.isActing ? 'Đang xử lý…' : confirm.submit}</Button>
            </XStack>
          </YStack>
        </YStack>
      ) : null}
    </SafeAreaView>
  );
}

export default AdminScreen;
