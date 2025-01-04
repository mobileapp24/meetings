import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable LayoutAnimation on Android (if the experimental flag is available), ensuring animations work smoothly
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Properties of the AccordionSection
interface AccordionSectionProps {
  title: string;
  children: React.ReactNode; //content rendered inside the accordion (expanded)
}

// Component that renders a section with expandable content
const AccordionSection: React.FC<AccordionSectionProps> = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(false); // State that determunes whether the content is visible

  // Function to change the expansion state
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // next layout animation
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Header: toggles the expansion when pressed */}
      <TouchableOpacity style={styles.header} onPress={toggleExpand}>
        <Text style={styles.headerText}>{title}</Text>
        {/* Displays an arrow icon that changes based on the expansion state */}
        <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Render content if expanded */}
      {isExpanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffff',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  expandIcon: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    padding: 16,
  },
});

export default AccordionSection;

