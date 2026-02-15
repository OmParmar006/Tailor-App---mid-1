import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { measurementConfig } from "../config/measurementConfig";

export default function MeasurementScreen({ route, navigation }) {
  const { garment } = route.params;
  const config = measurementConfig[garment];

  const [values, setValues] = useState({});

  const updateValue = (key, val) => {
    setValues({ ...values, [key]: val });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#E5E7EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Take Measurements</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* GARMENT TITLE */}
      <Text style={styles.garmentTitle}>{config.title}</Text>

      <ScrollView contentContainerStyle={styles.container}>
        {config.fields.map((field) => (
          <View key={field.key} style={styles.row}>
            <View style={styles.bodyIcon} />
            <View style={styles.fieldInfo}>
              <Text style={styles.label}>{field.label}</Text>
            </View>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#64748B"
              value={values[field.key] || ""}
              onChangeText={(val) => updateValue(field.key, val)}
            />
          </View>
        ))}
      </ScrollView>

      {/* SAVE */}
      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveText}>Save & Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
