#!/usr/bin/env python3
"""
Codebase File Statistics Analyzer
Calculates file counts and total sizes grouped by extension, automatically ignoring build/cache directories.
"""

import os
import sys
import argparse

EXCLUDE_DIRS = {
    '.git',
    'node_modules',
    '.gemini',
    '.output',
    '.next',
    '.cache',
    'dist',
    'build',
    'coverage',
    '.turbo',
    '.vercel'
}

def format_size(bytes_size):
    if bytes_size < 1024:
        return f"{bytes_size} B"
    elif bytes_size < 1024 * 1024:
        return f"{bytes_size / 1024:.2f} KB"
    elif bytes_size < 1024 * 1024 * 1024:
        return f"{bytes_size / (1024 * 1024):.2f} MB"
    else:
        return f"{bytes_size / (1024 * 1024 * 1024):.2f} GB"

def analyze_directory(root_dir='.'):
    stats = {}
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for f in filenames:
            ext = os.path.splitext(f)[1].lower()
            if not ext:
                ext = '(no extension)'
            else:
                ext = ext[1:]  # Remove leading dot
            
            full_path = os.path.join(dirpath, f)
            try:
                size = os.path.getsize(full_path)
            except OSError:
                size = 0
                
            if ext not in stats:
                stats[ext] = {'count': 0, 'size': 0}
            stats[ext]['count'] += 1
            stats[ext]['size'] += size
    return stats

def main():
    parser = argparse.ArgumentParser(description="Analyze codebase file counts and sizes by extension.")
    parser.add_argument('--path', '-p', default='.', help="Directory to analyze (default: current directory)")
    parser.add_argument('--sort', '-s', choices=['count', 'size', 'ext'], default='count', help="Sort metric (default: count)")
    parser.add_argument('--format', '-f', choices=['table', 'compact', 'all'], default='all', help="Output format (default: all)")
    args = parser.parse_args()

    stats = analyze_directory(args.path)

    if args.sort == 'count':
        sorted_stats = sorted(stats.items(), key=lambda x: (x[1]['count'], x[1]['size']), reverse=True)
    elif args.sort == 'size':
        sorted_stats = sorted(stats.items(), key=lambda x: (x[1]['size'], x[1]['count']), reverse=True)
    else:
        sorted_stats = sorted(stats.items(), key=lambda x: x[0])

    if args.format in ('table', 'all'):
        print("| File Type | Count | Total Size |")
        print("| :--- | :--- | :--- |")
        for ext, data in sorted_stats:
            ext_label = ext if ext == '(no extension)' else f"`.{ext}`"
            print(f"| **{ext_label}** | **{data['count']}** | {format_size(data['size'])} |")

    if args.format == 'all':
        print("\n---\n")

    if args.format in ('compact', 'all'):
        compact_entries = []
        for ext, data in sorted_stats:
            compact_entries.append(f"{ext} {data['count']} {format_size(data['size']).replace(' ', '')}")
        print(", ".join(compact_entries))

if __name__ == '__main__':
    main()
