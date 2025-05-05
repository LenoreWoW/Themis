import supabase from './supabase';

// Example function to fetch data from a table
export async function fetchData(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Example function to fetch a single item by ID
export async function fetchItemById(tableName: string, id: string | number) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching item with id ${id}:`, error);
    throw error;
  }
}

// Example function to insert data
export async function insertData(tableName: string, data: any) {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error inserting data:', error);
    throw error;
  }
}

// Example function to update data
export async function updateData(tableName: string, id: string | number, data: any) {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return result;
  } catch (error) {
    console.error(`Error updating item with id ${id}:`, error);
    throw error;
  }
}

// Example function to delete data
export async function deleteData(tableName: string, id: string | number) {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting item with id ${id}:`, error);
    throw error;
  }
}

// Example function for authentication - sign up
export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

// Example function for authentication - sign in
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// Example function for authentication - sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Example function to get the current user
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
} 