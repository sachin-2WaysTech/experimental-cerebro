import { useState, useEffect } from 'react';

interface FieldWithVisibility {
  name: string;
  display_options?: {
    show?: {
      [key: string]: string[];
    };
  };
  depends_on?: string[];
  type_options?: {
    load_options_depends_on?: string[];
    [key: string]: any;
  };
}

/**
 * Custom hook to manage field visibility based on display conditions and dependencies
 * @param fields - Array of fields that can have visibility conditions
 * @param formValues - Current form values to check against conditions
 * @returns Set of visible field names
 */
export const useFieldVisibility = <T extends FieldWithVisibility>(
  fields: T[],
  formValues: Record<string, unknown>
) => {
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newVisibleFields = new Set<string>();

    fields.forEach((field) => {
      let isVisible = true;

      // Check display_options.show conditions
      if (field.display_options?.show) {
        isVisible = Object.entries(field.display_options.show).every(
          ([fieldName, allowedValues]) => {
            const currentValue = formValues[fieldName] as string;
            return allowedValues.includes(currentValue);
          }
        );
      }

      // Check depends_on conditions (fields should have values)
      if (isVisible && field.depends_on && field.depends_on.length > 0) {
        isVisible = field.depends_on.every((dependencyField: string) => {
          const dependencyValue = formValues[dependencyField];
          return dependencyValue !== undefined && dependencyValue !== null && dependencyValue !== "";
        });
      }

      // Check load_options_depends_on conditions (fields should have values)
      if (isVisible && field.type_options?.load_options_depends_on && field.type_options.load_options_depends_on.length > 0) {
        isVisible = field.type_options.load_options_depends_on.every((dependencyField: string) => {
          const dependencyValue = formValues[dependencyField];
          return dependencyValue !== undefined && dependencyValue !== null && dependencyValue !== "";
        });
      }

      if (isVisible) {
        newVisibleFields.add(field.name);
      }
    });

    // Only update state if the visible fields actually changed
    setVisibleFields((prevVisible) => {
      const prevArray = Array.from(prevVisible).sort();
      const newArray = Array.from(newVisibleFields).sort();

      if (
        prevArray.length !== newArray.length ||
        !prevArray.every((field, index) => field === newArray[index])
      ) {
        return newVisibleFields;
      }
      return prevVisible;
    });
  }, [fields, JSON.stringify(formValues)]); // Stringify to make comparison stable

  return visibleFields;
};
