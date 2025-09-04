import fs from "fs-extra";
import path from "path";

export interface XmlMergeOptions {
  preserveExisting: boolean;
  addNamespace?: string;
  mergeBehavior: "append" | "replace" | "merge";
}

export class XmlMerger {
  /**
   * Merge XML content by parsing and combining resources
   */
  static async mergeXmlFile(
    filePath: string,
    newContent: string,
    options: XmlMergeOptions = {
      preserveExisting: true,
      mergeBehavior: "merge",
    }
  ): Promise<void> {
    try {
      let finalContent = newContent;

      // Check if file exists
      if (await fs.pathExists(filePath)) {
        const existingContent = await fs.readFile(filePath, "utf-8");

        // If it's an XML resources file, merge intelligently
        if (
          this.isResourcesXml(existingContent) &&
          this.isResourcesXml(newContent)
        ) {
          finalContent = await this.mergeResourcesXml(
            existingContent,
            newContent,
            options
          );
        } else if (
          options.preserveExisting &&
          options.mergeBehavior === "append"
        ) {
          // For non-resources XML, append new content
          finalContent = this.appendXmlContent(existingContent, newContent);
        } else if (
          options.preserveExisting &&
          options.mergeBehavior === "merge"
        ) {
          // Try to intelligently merge
          finalContent = await this.smartMergeXml(existingContent, newContent);
        }
        // If mergeBehavior is 'replace', use newContent as is
      }

      await fs.outputFile(filePath, finalContent);
    } catch (error) {
      console.warn(
        `⚠️  Warning: Could not merge XML file ${filePath}, writing new content:`,
        error
      );
      await fs.outputFile(filePath, newContent);
    }
  }

  /**
   * Check if XML content is a resources file
   */
  private static isResourcesXml(content: string): boolean {
    return content.includes("<resources>") && content.includes("</resources>");
  }

  /**
   * Merge two Android resources XML files
   */
  private static async mergeResourcesXml(
    existingContent: string,
    newContent: string,
    options: XmlMergeOptions
  ): Promise<string> {
    // Extract existing resources
    const existingResources = this.extractResourcesFromXml(existingContent);
    const newResources = this.extractResourcesFromXml(newContent);

    // Extract XML declaration and comments
    const xmlDeclaration =
      this.extractXmlDeclaration(existingContent) ||
      this.extractXmlDeclaration(newContent) ||
      '<?xml version="1.0" encoding="utf-8"?>';

    // Merge resources
    const mergedResources = this.mergeResourceArrays(
      existingResources,
      newResources,
      options
    );

    // Build final XML
    const finalXml = this.buildResourcesXml(xmlDeclaration, mergedResources);
    return finalXml;
  }

  /**
   * Extract styles with their full content
   */
  private static extractResourcesFromXml(content: string): XmlResource[] {
    const resources: XmlResource[] = [];

    // Extract colors
    const colorMatches = content.matchAll(
      /<color\s+name="([^"]+)">([^<]+)<\/color>/g
    );
    for (const match of colorMatches) {
      resources.push({
        type: "color",
        name: match[1],
        value: match[2],
        raw: match[0],
      });
    }

    // Extract styles with full content and attributes
    const styleMatches = content.matchAll(
      /<style\s+name="([^"]+)"([^>]*?)>([\s\S]*?)<\/style>/g
    );
    for (const match of styleMatches) {
      const attributes = match[2]; // parent and other attributes
      resources.push({
        type: "style",
        name: match[1],
        value: match[3], // style content (items)
        raw: match[0],
        attributes: attributes.trim(),
      });
    }

    // Extract strings
    const stringMatches = content.matchAll(
      /<string\s+name="([^"]+)">([^<]+)<\/string>/g
    );
    for (const match of stringMatches) {
      resources.push({
        type: "string",
        name: match[1],
        value: match[2],
        raw: match[0],
      });
    }

    // Extract dimension resources
    const dimenMatches = content.matchAll(
      /<dimen\s+name="([^"]+)">([^<]+)<\/dimen>/g
    );
    for (const match of dimenMatches) {
      resources.push({
        type: "dimen",
        name: match[1],
        value: match[2],
        raw: match[0],
      });
    }

    // Extract drawable resources
    const drawableMatches = content.matchAll(
      /<drawable\s+name="([^"]+)">([^<]+)<\/drawable>/g
    );
    for (const match of drawableMatches) {
      resources.push({
        type: "drawable",
        name: match[1],
        value: match[2],
        raw: match[0],
      });
    }

    // Extract other simple resources but exclude items and styles
    const otherMatches = content.matchAll(
      /<(\w+)\s+name="([^"]+)"[^>]*>([^<]+)<\/\1>/g
    );
    for (const match of otherMatches) {
      const type = match[1];
      if (
        !["color", "string", "dimen", "style", "drawable", "item"].includes(
          type
        )
      ) {
        resources.push({
          type: type,
          name: match[2],
          value: match[3],
          raw: match[0],
        });
      }
    }

    return resources;
  }

  /**
   * Merge resource arrays with conflict resolution
   */
  private static mergeResourceArrays(
    existing: XmlResource[],
    newResources: XmlResource[],
    options: XmlMergeOptions
  ): XmlResource[] {
    const merged: XmlResource[] = [...existing];
    const existingNames = new Set(existing.map((r) => `${r.type}:${r.name}`));

    for (const newResource of newResources) {
      const resourceKey = `${newResource.type}:${newResource.name}`;

      if (existingNames.has(resourceKey)) {
        if (!options.preserveExisting) {
          // Replace existing resource
          const index = merged.findIndex(
            (r) => `${r.type}:${r.name}` === resourceKey
          );
          if (index !== -1) {
            merged[index] = newResource;
          }
        }
        // If preserveExisting is true, keep the existing resource
      } else {
        // Add new resource
        merged.push(newResource);
      }
    }

    return merged;
  }

  /**
   * Build final resources XML from merged resources
   */
  private static buildResourcesXml(
    xmlDeclaration: string,
    resources: XmlResource[]
  ): string {
    const grouped = this.groupResourcesByType(resources);

    let xml = xmlDeclaration + "\n<resources>\n";

    // Add comments for each section
    for (const [type, typeResources] of Object.entries(grouped)) {
      if (typeResources.length > 0) {
        xml += `\n    <!-- ${
          type.charAt(0).toUpperCase() + type.slice(1)
        } Resources -->\n`;

        for (const resource of typeResources) {
          // Format the resource with proper indentation
          const formattedResource = this.formatResourceXml(resource);
          xml += `    ${formattedResource}\n`;
        }
      }
    }

    xml += "\n</resources>";
    return xml;
  }

  /**
   * Group resources by type
   */
  private static groupResourcesByType(
    resources: XmlResource[]
  ): Record<string, XmlResource[]> {
    const grouped: Record<string, XmlResource[]> = {};

    for (const resource of resources) {
      if (!grouped[resource.type]) {
        grouped[resource.type] = [];
      }
      grouped[resource.type].push(resource);
    }

    return grouped;
  }

  /**
   * Format individual resource XML
   */
  private static formatResourceXml(resource: XmlResource): string {
    switch (resource.type) {
      case "style":
        // For styles, ensure proper indentation of items and include attributes
        const styleContent = resource.value.replace(/^\s+/gm, "        ");
        const attributes = resource.attributes ? ` ${resource.attributes}` : "";
        return `<style name="${resource.name}"${attributes}>\n${styleContent}\n    </style>`;

      case "color":
      case "string":
      case "dimen":
        return `<${resource.type} name="${resource.name}">${resource.value}</${resource.type}>`;

      default:
        // For other types, return as-is but clean up indentation
        return resource.raw.replace(/^\s+/gm, "");
    }
  }

  /**
   * Extract XML declaration
   */
  private static extractXmlDeclaration(content: string): string | null {
    const match = content.match(/<\?xml[^>]+\?>/);
    return match ? match[0] : null;
  }

  /**
   * Smart merge for general XML content
   */
  private static async smartMergeXml(
    existingContent: string,
    newContent: string
  ): Promise<string> {
    // For non-resources XML, try to merge root elements
    const existingRoot = this.extractRootElement(existingContent);
    const newRoot = this.extractRootElement(newContent);

    if (existingRoot && newRoot && existingRoot === newRoot) {
      // Same root element, try to merge children
      return this.mergeXmlElements(existingContent, newContent);
    }

    // If different or can't parse, append
    return this.appendXmlContent(existingContent, newContent);
  }

  /**
   * Extract root element name
   */
  private static extractRootElement(content: string): string | null {
    const match = content.match(/<([^?\s>]+)[^>]*>/);
    return match ? match[1] : null;
  }

  /**
   * Merge XML elements (basic implementation)
   */
  private static mergeXmlElements(
    existing: string,
    newContent: string
  ): string {
    // Simple merge by combining content inside root element
    const existingBody = existing.match(/<[^>]+>([\s\S]*)<\/[^>]+>/)?.[1] || "";
    const newBody = newContent.match(/<[^>]+>([\s\S]*)<\/[^>]+>/)?.[1] || "";

    const declaration =
      this.extractXmlDeclaration(existing) ||
      this.extractXmlDeclaration(newContent) ||
      "";
    const rootMatch = existing.match(/<([^?\s>]+)[^>]*>/);
    const rootElement = rootMatch ? rootMatch[0] : "<root>";
    const rootElementClose = rootMatch ? `</${rootMatch[1]}>` : "</root>";

    return `${declaration}\n${rootElement}\n${existingBody}\n${newBody}\n${rootElementClose}`;
  }

  /**
   * Append XML content
   */
  private static appendXmlContent(
    existing: string,
    newContent: string
  ): string {
    return existing + "\n\n<!-- Generated by nitro-splash -->\n" + newContent;
  }

  /**
   * Create backup of existing file
   */
  static async createBackup(filePath: string): Promise<string | null> {
    try {
      if (await fs.pathExists(filePath)) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        await fs.copy(filePath, backupPath);
        return backupPath;
      }
    } catch (error) {
      console.warn(`⚠️  Could not create backup for ${filePath}:`, error);
    }
    return null;
  }
}

interface XmlResource {
  type: string;
  name: string;
  value: string;
  raw: string;
  attributes?: string;
}
