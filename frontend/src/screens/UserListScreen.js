import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import { resolveImageUrl } from '../services/api';
import { vi } from '../strings';

const colors = ['#E8F0FF', '#FCE8E4', '#E5F7F0', '#FFF3D9', '#F1EAFE'];
const initials = (name = '') => name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase() || 'U';

function Brand({ compact = false }) {
  return (
    <View style={[styles.brand, compact && styles.compactBrand]}>
      <View style={styles.brandMark}><Text style={styles.brandMarkText}>U</Text></View>
      <Text style={styles.brandText}>USERSPACE</Text>
    </View>
  );
}

function UserAvatar({ user, colorIndex }) {
  const imageUri = resolveImageUrl(user.image);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => { setImageFailed(false); }, [imageUri]);

  if (imageUri && !imageFailed) {
    return <Image source={{ uri: imageUri }} style={styles.avatar} onError={() => setImageFailed(true)} />;
  }
  return <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors[colorIndex % colors.length] }]}><Text style={styles.avatarText}>{initials(user.name)}</Text></View>;
}

function DashboardIllustration() {
  return (
    <View style={styles.heroArt}>
      <View style={styles.heroLeafA} /><View style={styles.heroLeafB} /><View style={styles.heroLeafC} />
      <View style={styles.heroLaptopBase} />
      <View style={styles.heroLaptop}>
        <View style={styles.heroLaptopScreen}>
          <View style={styles.heroScreenLines}><View style={styles.heroLineOne} /><View style={styles.heroLineTwo} /><View style={styles.heroLineThree} /></View>
        </View>
      </View>
      <View style={styles.heroShield}><Text style={styles.heroShieldText}>{'\u2713'}</Text></View>
      <View style={styles.heroSpark} />
    </View>
  );
}

function Sidebar() {
  const links = [
    { icon: '\u2302', label: vi.home, active: true },
  ];
  return (
    <View style={styles.sidebar}>
      <Brand compact />
      <View style={styles.sidebarLinks}>{links.map((link) => (
        <View key={link.label} style={[styles.sidebarLink, link.active && styles.sidebarLinkActive]}>
          <Text style={[styles.sidebarIcon, link.active && styles.sidebarIconActive]}>{link.icon}</Text>
          <Text style={[styles.sidebarLabel, link.active && styles.sidebarLabelActive]}>{link.label}</Text>
        </View>
      ))}</View>
      <View style={styles.sidebarBottomArt}>
        <View style={styles.sidebarPeople}><View style={styles.personOne} /><View style={styles.personTwo} /><View style={styles.personThree} /></View>
        <View style={styles.sidebarShield}><Text style={styles.sidebarShieldText}>{'\u2713'}</Text></View>
      </View>
      <Text style={styles.sidebarCaption}>{vi.adminArea}</Text>
    </View>
  );
}

export default function UserListScreen({ users, onAdd, onExport, onView, onEdit, onDelete, onLogout }) {
  const { width } = useWindowDimensions();
  const wide = width >= 1120;
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState('newest');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const matchingUsers = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase()));
    return matchingUsers.sort((left, right) => {
      if (sortMode === 'nameAsc') return (left.name || '').localeCompare(right.name || '', 'vi', { sensitivity: 'base' });
      if (sortMode === 'nameDesc') return (right.name || '').localeCompare(left.name || '', 'vi', { sensitivity: 'base' });
      return String(right.id).localeCompare(String(left.id));
    });
  }, [users, query, sortMode]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const visibleUsers = filtered.slice((page - 1) * 10, page * 10);
  const sortLabels = { nameAsc: vi.sortNameAsc, nameDesc: vi.sortNameDesc, newest: vi.sortNewest };
  useEffect(() => { setPage((currentPage) => Math.min(currentPage, pageCount)); }, [pageCount]);

  const confirmDelete = (user) => Alert.alert(vi.confirmDelete, `${vi.deleteHelp} ${user.name}?`, [
    { text: vi.cancel, style: 'cancel' }, { text: vi.delete, style: 'destructive', onPress: () => onDelete(user.id) },
  ]);

  const renderUser = (item, index) => (
    <View key={String(item.id)} style={[styles.userCard, !wide && styles.mobileUserCard]}>
      <UserAvatar user={item} colorIndex={index} />
      <View style={styles.userInfo}>
        <Text numberOfLines={1} style={styles.userName}>{item.name}</Text>
        <Text numberOfLines={1} style={styles.userEmail}>{item.email}</Text>
        <View style={styles.statusRow}><View style={styles.dot} /><Text style={styles.status}>{vi.active}</Text></View>
      </View>
      <View style={[styles.actions, !wide && styles.mobileActions]}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={vi.view} onPress={() => onView(item)} style={[styles.actionButton, styles.viewButton]}><Text style={styles.viewIcon}>{'\u25C9'}  {vi.view}</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={vi.edit} onPress={() => onEdit(item)} style={styles.actionButton}><Text style={styles.editIcon}>{'\u270E'}  Edit</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={vi.delete} onPress={() => confirmDelete(item)} style={[styles.actionButton, styles.deleteButton]}><Text style={styles.deleteIcon}>X</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.shell, wide && styles.wideShell]}>
        {wide ? <Sidebar /> : null}
        <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainContent} keyboardShouldPersistTaps="handled">
          {!wide ? <View style={styles.mobileTopbar}><Brand compact /><TouchableOpacity onPress={onLogout} style={styles.logout}><Text style={styles.logoutText}>{vi.logout}</Text></TouchableOpacity></View> : (
            <View style={styles.adminTopbar}><View /><View style={styles.adminProfile}><View style={styles.adminAvatar}><Text style={styles.adminAvatarText}>A</Text></View><Text style={styles.adminLabel}>ADMIN</Text><TouchableOpacity onPress={onLogout} style={styles.logout}><Text style={styles.logoutText}>{vi.logout}</Text></TouchableOpacity></View></View>
          )}

          <View style={styles.heroRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>{vi.dashboard}</Text>
              <View style={styles.eyebrowUnderline} />
              <Text style={styles.title}>{vi.users}</Text>
              <Text style={styles.subtitle}>{vi.manage}</Text>
            </View>
            {wide ? <DashboardIllustration /> : null}
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryIcon}><Text style={styles.summaryIconText}>{'\u2659'}</Text></View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCopy}><Text style={styles.summaryLabel}>{vi.total}</Text><Text style={styles.summaryNumber}>{users.length}</Text></View>
            <View pointerEvents="none" style={styles.summaryOrb} />
          </View>

          <View style={styles.panel}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionIcon}><Text style={styles.sectionIconText}>{'\u2315'}</Text></View>
                <View><Text style={styles.sectionTitle}>{vi.accounts}</Text><Text style={styles.sectionCaption}>{filtered.length} {vi.count}</Text></View>
              </View>
              <View style={styles.sectionActions}>
                <TouchableOpacity accessibilityRole="button" onPress={onExport} style={styles.exportButton}><Text style={styles.exportButtonText}>{'\u2913'}  Excel</Text></TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" onPress={onAdd} style={styles.addButton}><Text style={styles.addText}>{'+'}  {vi.addNew}</Text></TouchableOpacity>
              </View>
            </View>

            <View style={styles.search}><Text style={styles.searchIcon}>{'\u2315'}</Text><TextInput value={query} onChangeText={(value) => { setQuery(value); setPage(1); }} placeholder={vi.search} placeholderTextColor="#8290A8" style={styles.searchInput} /></View>
            <View style={styles.sortRow}><Text style={styles.sortLabel}>{vi.sortBy}</Text><TouchableOpacity accessibilityRole="button" onPress={() => { setSortMode((current) => current === 'nameAsc' ? 'nameDesc' : current === 'nameDesc' ? 'newest' : 'nameAsc'); setPage(1); }} style={styles.sortButton}><Text style={styles.sortButtonText}>{sortLabels[sortMode]}  {'\u2195'}</Text></TouchableOpacity></View>

            <View style={styles.userList}>
              {visibleUsers.length ? visibleUsers.map(renderUser) : <View style={styles.empty}><Text style={styles.emptyIcon}>U</Text><Text style={styles.emptyTitle}>{vi.empty}</Text><Text style={styles.emptyText}>{vi.emptyHelp}</Text><CustomButton title={vi.addNew} onPress={onAdd} style={styles.emptyButton} /></View>}
            </View>

            {filtered.length > 0 ? <View style={styles.pagination}><TouchableOpacity accessibilityRole="button" disabled={page <= 1} onPress={() => setPage((current) => current - 1)} style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}><Text style={styles.pageButtonText}>{vi.previous}</Text></TouchableOpacity><Text style={styles.pageLabel}>{vi.page} {page} / {pageCount}</Text><TouchableOpacity accessibilityRole="button" disabled={page >= pageCount} onPress={() => setPage((current) => current + 1)} style={[styles.pageButton, page >= pageCount && styles.pageButtonDisabled]}><Text style={styles.pageButtonText}>{vi.next}</Text></TouchableOpacity></View> : null}
          </View>
          <Text style={styles.pageFooter}>USERSPACE  /  ADMIN</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F6FF' },
  shell: { flex: 1, backgroundColor: '#F3F6FF' },
  wideShell: { flexDirection: 'row' },
  sidebar: { width: 286, backgroundColor: '#FBFCFF', borderRightWidth: 1, borderRightColor: '#E5EBF7', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  compactBrand: { marginBottom: 62 },
  brandMark: { width: 54, height: 54, borderRadius: 17, backgroundColor: '#2871F8', alignItems: 'center', justifyContent: 'center', shadowColor: '#286CF4', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  brandMarkText: { color: '#fff', fontSize: 30, fontWeight: '900' },
  brandText: { color: '#10274B', fontWeight: '900', letterSpacing: 1.5, fontSize: 16 },
  sidebarLinks: { gap: 8 },
  sidebarLink: { height: 58, borderRadius: 17, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 16 },
  sidebarLinkActive: { backgroundColor: '#E7EEFF' },
  sidebarIcon: { width: 24, color: '#7E8BA3', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  sidebarIconActive: { color: '#2671FA' },
  sidebarLabel: { color: '#64738E', fontSize: 15, fontWeight: '700' },
  sidebarLabelActive: { color: '#2671FA' },
  sidebarBottomArt: { height: 225, marginTop: 'auto', position: 'relative', justifyContent: 'center' },
  sidebarPeople: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, position: 'absolute', bottom: 28, left: 8 },
  personOne: { width: 39, height: 74, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#6396EF' },
  personTwo: { width: 50, height: 94, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: '#2871F8' },
  personThree: { width: 36, height: 68, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: '#8AB2F6' },
  sidebarShield: { position: 'absolute', right: 18, bottom: 28, width: 88, height: 108, backgroundColor: '#3279F5', borderRadius: 27, borderWidth: 5, borderColor: '#85ACFA', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '9deg' }] },
  sidebarShieldText: { color: '#fff', fontSize: 38, fontWeight: '900' },
  sidebarCaption: { color: '#92A0B7', fontSize: 10, letterSpacing: 1.2, fontWeight: '800', marginLeft: 5, marginTop: 8 },
  mainScroll: { flex: 1 },
  mainContent: { paddingHorizontal: 30, paddingTop: 22, paddingBottom: 30 },
  mobileTopbar: { minHeight: 62, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  adminTopbar: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  adminProfile: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  adminAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#2871F8', alignItems: 'center', justifyContent: 'center' },
  adminAvatarText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  adminLabel: { color: '#354967', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  logout: { paddingVertical: 9, paddingHorizontal: 12 },
  logoutText: { color: '#65748D', fontWeight: '700', fontSize: 12 },
  heroRow: { minHeight: 134, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative' },
  heroCopy: { zIndex: 1, paddingVertical: 8 },
  eyebrow: { color: '#2671FA', fontSize: 14, fontWeight: '900', letterSpacing: 0.7 },
  eyebrowUnderline: { width: 38, height: 3, backgroundColor: '#2671FA', marginTop: 12, marginBottom: 13, borderRadius: 2 },
  title: { color: '#10274B', fontSize: 40, lineHeight: 48, fontWeight: '900' },
  subtitle: { color: '#526680', fontSize: 16, fontWeight: '600', marginTop: 7 },
  heroArt: { width: 340, height: 152, position: 'relative', marginRight: 45 },
  heroLaptop: { position: 'absolute', right: 40, top: 10, width: 220, height: 122, backgroundColor: '#DCE8FF', borderColor: '#3569B0', borderWidth: 5, borderRadius: 16, padding: 12, transform: [{ rotate: '-8deg' }], shadowColor: '#315C9D', shadowOpacity: 0.16, shadowRadius: 8, shadowOffset: { width: 0, height: 6 } },
  heroLaptopScreen: { flex: 1, backgroundColor: '#F8FBFF', borderRadius: 8, flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
  heroScreenAvatar: { width: 55, height: 55, borderRadius: 17, backgroundColor: '#D8E7FF', alignItems: 'center', justifyContent: 'center' },
  heroScreenAvatarText: { color: '#2871F8', fontSize: 24, fontWeight: '900' },
  heroScreenLines: { flex: 1, gap: 8 },
  heroLineOne: { width: '72%', height: 7, borderRadius: 4, backgroundColor: '#7EAAFA' },
  heroLineTwo: { width: '94%', height: 6, borderRadius: 4, backgroundColor: '#C0D5FB' },
  heroLineThree: { width: '63%', height: 6, borderRadius: 4, backgroundColor: '#C0D5FB' },
  heroLaptopBase: { position: 'absolute', right: 17, top: 128, width: 255, height: 9, borderRadius: 5, backgroundColor: '#6D8FC7', transform: [{ rotate: '-4deg' }] },
  heroShield: { position: 'absolute', right: 8, bottom: 8, width: 68, height: 82, borderRadius: 22, borderColor: '#8BB1FB', borderWidth: 4, backgroundColor: '#3178F4', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '11deg' }] },
  heroShieldText: { color: '#fff', fontSize: 31, fontWeight: '900' },
  heroLeafA: { position: 'absolute', width: 33, height: 78, left: 15, bottom: 24, borderRadius: 30, backgroundColor: '#C9DBFC', transform: [{ rotate: '-30deg' }] },
  heroLeafB: { position: 'absolute', width: 34, height: 74, left: 47, bottom: 22, borderRadius: 30, backgroundColor: '#BCD3FB', transform: [{ rotate: '26deg' }] },
  heroLeafC: { position: 'absolute', width: 30, height: 66, left: 71, bottom: 17, borderRadius: 30, backgroundColor: '#D4E2FC', transform: [{ rotate: '55deg' }] },
  heroSpark: { position: 'absolute', right: 0, top: 7, width: 9, height: 34, borderRadius: 5, backgroundColor: '#3C82F7', transform: [{ rotate: '22deg' }] },
  summary: { minHeight: 110, borderRadius: 21, backgroundColor: '#4387F7', paddingHorizontal: 28, paddingVertical: 17, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', marginTop: 11, marginBottom: 26, shadowColor: '#3277EC', shadowOpacity: 0.17, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  summaryIcon: { width: 68, alignItems: 'center', justifyContent: 'center' },
  summaryIconText: { color: '#EAF2FF', fontSize: 42, fontWeight: '900' },
  summaryDivider: { width: 1, height: 55, backgroundColor: 'rgba(255,255,255,0.48)', marginHorizontal: 20 },
  summaryCopy: { zIndex: 1 },
  summaryLabel: { color: '#E5EEFF', fontSize: 14, fontWeight: '700' },
  summaryNumber: { color: '#fff', fontSize: 32, lineHeight: 38, fontWeight: '900', marginTop: 3 },
  summaryOrb: { position: 'absolute', right: -65, bottom: -145, width: 310, height: 230, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.1)', transform: [{ rotate: '-18deg' }] },
  panel: { backgroundColor: '#fff', borderRadius: 23, borderWidth: 1, borderColor: '#E7ECF6', padding: 21, shadowColor: '#365C98', shadowOpacity: 0.07, shadowRadius: 15, shadowOffset: { width: 0, height: 6 } },
  sectionRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 14, flexShrink: 1 },
  sectionIcon: { width: 56, height: 56, borderRadius: 17, backgroundColor: '#EAF0FF', alignItems: 'center', justifyContent: 'center' },
  sectionIconText: { color: '#2871F8', fontSize: 30, fontWeight: '800' },
  sectionTitle: { color: '#10274B', fontSize: 17, fontWeight: '900' },
  sectionCaption: { color: '#7C8CA6', fontSize: 12, marginTop: 3 },
  sectionActions: { flexDirection: 'row', gap: 9, alignItems: 'center' },
  addButton: { backgroundColor: '#286EFA', borderRadius: 14, paddingHorizontal: 16, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#286EFA', shadowOpacity: 0.19, shadowRadius: 9, shadowOffset: { width: 0, height: 5 } },
  addText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  exportButton: { backgroundColor: '#EDF4FF', borderRadius: 13, paddingHorizontal: 14, minHeight: 44, justifyContent: 'center' },
  exportButtonText: { color: '#2D70E8', fontSize: 12, fontWeight: '800' },
  search: { height: 48, backgroundColor: '#F9FAFD', borderWidth: 1, borderColor: '#E1E7F2', borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 12 },
  searchIcon: { color: '#667A99', fontSize: 25, marginRight: 10, fontWeight: '700' },
  searchInput: { flex: 1, fontSize: 14, color: '#263954' },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sortLabel: { color: '#596B87', fontSize: 12, fontWeight: '700' },
  sortButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E3EAF6', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 8 },
  sortButtonText: { color: '#687A97', fontSize: 12, fontWeight: '700' },
  userList: { gap: 8 },
  userCard: { minHeight: 78, backgroundColor: '#fff', borderRadius: 17, borderWidth: 1, borderColor: '#E9EEF8', paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#3D629B', shadowOpacity: 0.03, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  mobileUserCard: { flexWrap: 'wrap' },
  avatar: { width: 53, height: 53, borderRadius: 19 },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#33415A', fontWeight: '800', fontSize: 14 },
  userInfo: { flex: 1, minWidth: 0, marginLeft: 13, gap: 3 },
  userName: { color: '#203653', fontWeight: '800', fontSize: 14 },
  userEmail: { color: '#7D8BA3', fontSize: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  status: { color: '#16A878', fontSize: 10, fontWeight: '700' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#24B47E' },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 7, marginLeft: 8 },
  mobileActions: { width: '100%', marginLeft: 0, marginTop: 9 },
  actionButton: { minWidth: 54, height: 34, borderRadius: 12, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  viewButton: { backgroundColor: '#E6F7F0' },
  viewIcon: { color: '#12946A', fontSize: 11, fontWeight: '800' },
  editIcon: { color: '#2B73EC', fontSize: 11, fontWeight: '800' },
  deleteButton: { backgroundColor: '#FFF0F0', minWidth: 36 },
  deleteIcon: { color: '#E34F4F', fontSize: 17, fontWeight: '900' },
  empty: { alignItems: 'center', paddingVertical: 34, paddingHorizontal: 20 },
  emptyIcon: { color: '#C3D2EE', fontSize: 36, fontWeight: '800' },
  emptyTitle: { color: '#243149', fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptyText: { color: '#8B96A6', fontSize: 12, textAlign: 'center', marginTop: 5 },
  emptyButton: { marginTop: 18, minHeight: 43 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingTop: 17, paddingBottom: 3 },
  pageButton: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 11, backgroundColor: '#EEF4FF' },
  pageButtonDisabled: { opacity: 0.4 },
  pageButtonText: { color: '#3678EC', fontSize: 12, fontWeight: '700' },
  pageLabel: { color: '#58667C', fontSize: 12, fontWeight: '600' },
  pageFooter: { color: '#A1AEC2', fontSize: 10, letterSpacing: 1.3, fontWeight: '800', textAlign: 'center', marginTop: 20 },
});
