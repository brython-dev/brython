import setuptools

setuptools.setup(
    name="brython-stubs",
    version="3.10.5",
    author="Pierre Quentel",
    author_email="quentel.pierre@orange.fr",
    description="Stubs to use with brython",
    long_description="Stubs to use with brython",
    url="https://github.com/brython-dev/brython/",
    project_urls={
        "Bug Tracker": "https://github.com/brython-dev/brython/issues/",
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: BSD-3-Clause",
        "Operating System :: OS Independent",
    ],
    packages=["browser"],
    package_data={"browser": ["*.pyi", "py.typed"]},
    python_requires=">=3.7",
)
