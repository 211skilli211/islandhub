import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CATEGORY_SCHEMAS, FormField } from '../lib/schemas';

interface DynamicFormProps {
    category: string;
    subType: string;
    metadata: any;
    onChange: (metadata: any) => void;
}

export default function DynamicForm({ category, subType, metadata, onChange }: DynamicFormProps) {
    const schema = CATEGORY_SCHEMAS[category.toLowerCase()]?.[subType];

    if (!schema) {
        return (
            <View style={styles.missingContainer}>
                <Text style={styles.missingText}>Standard details will be used for this category.</Text>
            </View>
        );
    }

    const renderInnerField = (field: FormField, currentMetadata: any, onFieldChange: (name: string, value: any) => void) => {
        const value = currentMetadata[field.name];

        switch (field.type) {
            case 'text':
            case 'number':
                return (
                    <TextInput
                        placeholder={field.placeholder}
                        value={value !== undefined ? String(value) : ''}
                        onChangeText={(text) => onFieldChange(field.name, field.type === 'number' ? parseFloat(text) : text)}
                        keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                        style={styles.input}
                    />
                );
            case 'textarea':
                return (
                    <TextInput
                        placeholder={field.placeholder}
                        value={value || ''}
                        onChangeText={(text) => onFieldChange(field.name, text)}
                        multiline
                        numberOfLines={4}
                        style={[styles.input, styles.textArea]}
                    />
                );
            case 'boolean':
                return (
                    <TouchableOpacity
                        onPress={() => onFieldChange(field.name, !value)}
                        style={[styles.toggle, value && styles.toggleActive]}
                    >
                        <View style={[styles.toggleCircle, value && styles.toggleCircleActive]} />
                        <Text style={[styles.toggleText, value && styles.toggleTextActive]}>
                            {value ? 'Yes' : 'No'}
                        </Text>
                    </TouchableOpacity>
                );
            case 'select':
                return (
                    <View style={styles.optionsGrid}>
                        {field.options?.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                onPress={() => onFieldChange(field.name, opt.value)}
                                style={[styles.optionButton, value === opt.value && styles.optionButtonActive]}
                            >
                                <Text style={[styles.optionText, value === opt.value && styles.optionTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 'multiselect':
                const selected = Array.isArray(value) ? value : [];
                const toggle = (val: string) => {
                    if (selected.includes(val)) {
                        onFieldChange(field.name, selected.filter(v => v !== val));
                    } else {
                        onFieldChange(field.name, [...selected, val]);
                    }
                };
                return (
                    <View style={styles.optionsGrid}>
                        {field.options?.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                onPress={() => toggle(opt.value)}
                                style={[styles.optionButton, selected.includes(opt.value) && styles.optionButtonActive]}
                            >
                                <Text style={[styles.optionText, selected.includes(opt.value) && styles.optionTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 'repeatable_section':
                const items = Array.isArray(value) ? value : [];
                const addItem = () => onFieldChange(field.name, [...items, {}]);
                const removeItem = (index: number) => onFieldChange(field.name, items.filter((_, i) => i !== index));
                const updateItem = (index: number, itemData: any) => {
                    const newItems = [...items];
                    newItems[index] = itemData;
                    onFieldChange(field.name, newItems);
                };

                return (
                    <View style={styles.repeatableContainer}>
                        {items.map((item, index) => (
                            <View key={index} style={styles.repeatableItem}>
                                <TouchableOpacity
                                    onPress={() => removeItem(index)}
                                    style={styles.removeButton}
                                >
                                    <Text style={styles.removeButtonText}>×</Text>
                                </TouchableOpacity>
                                {field.schema?.map(subField => (
                                    <View key={subField.name} style={styles.subFieldContainer}>
                                        <Text style={styles.subLabel}>{subField.label}</Text>
                                        {renderInnerField(subField, item, (name, val) => updateItem(index, { ...item, [name]: val }))}
                                    </View>
                                ))}
                            </View>
                        ))}
                        <TouchableOpacity onPress={addItem} style={styles.addButton}>
                            <Text style={styles.addButtonText}>+ Add {field.label}</Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.sectionHeader}>
                <View style={styles.indicator} />
                <Text style={styles.sectionTitle}>Category Specifics</Text>
            </View>

            {schema.fields.map((field) => (
                <View key={field.name} style={styles.fieldContainer}>
                    <Text style={styles.label}>
                        {field.label} {field.required && <Text style={styles.required}>*</Text>}
                    </Text>
                    {renderInnerField(field, metadata, (name, val) => onChange({ ...metadata, [name]: val }))}
                    {field.helperText && <Text style={styles.helperText}>{field.helperText}</Text>}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8fafc',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        marginVertical: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    indicator: {
        width: 4,
        height: 20,
        backgroundColor: '#0d9488',
        borderRadius: 2,
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    required: {
        color: '#ef4444',
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#f1f5f9',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#0f172a',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    helperText: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
        marginLeft: 4,
    },
    toggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#f1f5f9',
    },
    toggleActive: {
        borderColor: '#0d9488',
        backgroundColor: '#f0fdfa',
    },
    toggleCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        marginRight: 10,
    },
    toggleCircleActive: {
        backgroundColor: '#0d9488',
        borderColor: '#0d9488',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    toggleTextActive: {
        color: '#0f766e',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#f1f5f9',
    },
    optionButtonActive: {
        backgroundColor: '#0d9488',
        borderColor: '#0d9488',
    },
    optionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    optionTextActive: {
        color: 'white',
    },
    missingContainer: {
        padding: 24,
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#cbd5e1',
        alignItems: 'center',
    },
    missingText: {
        color: '#64748b',
        fontWeight: '600',
        textAlign: 'center',
    },
    repeatableContainer: {
        marginVertical: 10,
    },
    repeatableItem: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 16,
        position: 'relative',
    },
    removeButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#ef4444',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    removeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    subFieldContainer: {
        marginBottom: 12,
    },
    subLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginBottom: 4,
        marginLeft: 4,
    },
    addButton: {
        padding: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#0d9488',
        borderRadius: 16,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#0d9488',
        fontWeight: '800',
        textTransform: 'uppercase',
        fontSize: 12,
    }
});
