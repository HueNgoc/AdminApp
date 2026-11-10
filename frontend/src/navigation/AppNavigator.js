import { useState } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import UserListScreen from '../screens/UserListScreen';
import AddUserScreen from '../screens/AddUserScreen';
import EditUserScreen from '../screens/EditUserScreen';
import ViewUserScreen from '../screens/ViewUserScreen';
import { api } from '../services/api';
import { exportUsersToExcel } from '../services/exportUsers';
import { vi } from '../strings';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Login">
          {({ navigation }) => (
            <LoginScreen onLogin={async (credentials) => {
              const session = await api.login(credentials);
              const response = await api.getUsers(session.token);
              setToken(session.token);
              setUsers(response.users);
              navigation.replace('UserList');
            }} />
          )}
        </Stack.Screen>
        <Stack.Screen name="UserList">
          {({ navigation }) => (
            <UserListScreen
              users={users}
              onExport={async () => {
                try {
                  await exportUsersToExcel(users);
                } catch (error) {
                  Alert.alert(vi.actionFailed, error.message);
                }
              }}
              onAdd={() => navigation.navigate('AddUser')}
              onView={(user) => navigation.navigate('ViewUser', { user })}
              onEdit={(user) => navigation.navigate('EditUser', { user })}
              onDelete={async (id) => {
                try {
                  await api.deleteUser(id, token);
                  setUsers((current) => current.filter((item) => item.id !== id));
                } catch (error) {
                  Alert.alert(vi.loginFailed, error.message);
                }
              }}
              onLogout={() => {
                setToken(null);
                setUsers([]);
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="ViewUser">
          {({ navigation, route }) => (
            <ViewUserScreen user={route.params.user} onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>
        <Stack.Screen name="AddUser">
          {({ navigation }) => (
            <AddUserScreen
              onBack={() => navigation.goBack()}
              onSave={async (user) => {
                const response = await api.createUser(user, token);
                setUsers((current) => [response.user, ...current]);
                navigation.goBack();
                Alert.alert(vi.success, vi.added);
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="EditUser">
          {({ navigation, route }) => (
            <EditUserScreen
              user={route.params.user}
              onBack={() => navigation.goBack()}
              onSave={async (updated) => {
                const response = await api.updateUser(updated.id, updated, token);
                setUsers((current) => current.map((item) => item.id === updated.id ? response.user : item));
                navigation.goBack();
                Alert.alert(vi.success, vi.saved);
              }}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
